package com.buildnchill.shop;

import org.bukkit.Bukkit;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.scheduler.BukkitTask;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Minecraft Shop Plugin
 * Poll Supabase REST API để lấy orders và thực thi commands
 * 
 * @author BuildnChill
 * @version 1.0.0
 */
public class MinecraftShopPlugin extends JavaPlugin {
    
    private static final Logger logger = Logger.getLogger("MinecraftShopPlugin");
    
    // Cấu hình - THAY ĐỔI CÁC GIÁ TRỊ NÀY
    private String supabaseUrl = "https://your-project.supabase.co";
    private String supabaseAnonKey = "your-anon-key";
    private int pollInterval = 15; // Giây (10-20 giây)
    
    private BukkitTask pollTask;
    private final List<String> processedOrderIds = new ArrayList<>(); // Tránh xử lý trùng
    
    @Override
    public void onEnable() {
        logger.info("========================================");
        logger.info("Minecraft Shop Plugin đang khởi động...");
        logger.info("========================================");
        
        // Load config từ config.yml
        saveDefaultConfig();
        reloadConfig();
        supabaseUrl = getConfig().getString("supabase.url", supabaseUrl);
        supabaseAnonKey = getConfig().getString("supabase.anon_key", supabaseAnonKey);
        pollInterval = getConfig().getInt("poll.interval_seconds", pollInterval);
        
        // Validate config
        if (supabaseUrl.contains("your-project") || supabaseAnonKey.contains("your-anon-key")) {
            logger.severe("========================================");
            logger.severe("LỖI: Chưa cấu hình Supabase!");
            logger.severe("Vui lòng chỉnh sửa config.yml");
            logger.severe("========================================");
            getServer().getPluginManager().disablePlugin(this);
            return;
        }
        
        logger.info("Supabase URL: " + supabaseUrl);
        logger.info("Poll interval: " + pollInterval + " giây");
        
        // Bắt đầu polling task
        startPolling();
        
        logger.info("========================================");
        logger.info("Minecraft Shop Plugin đã sẵn sàng!");
        logger.info("========================================");
    }
    
    @Override
    public void onDisable() {
        if (pollTask != null && !pollTask.isCancelled()) {
            pollTask.cancel();
        }
        logger.info("Minecraft Shop Plugin đã tắt.");
    }
    
    /**
     * Bắt đầu polling Supabase mỗi N giây
     */
    private void startPolling() {
        pollTask = Bukkit.getScheduler().runTaskTimerAsynchronously(
            this,
            this::pollSupabase,
            0L, // Delay ban đầu (0 = chạy ngay)
            pollInterval * 20L // Convert giây sang ticks (1 giây = 20 ticks)
        );
    }
    
    /**
     * Poll Supabase để lấy orders có status='paid' và delivered=false
     */
    private void pollSupabase() {
        try {
            List<Order> orders = fetchOrders();
            
            if (orders.isEmpty()) {
                logger.fine("Không có order nào cần xử lý.");
                return;
            }
            
            logger.info("Tìm thấy " + orders.size() + " order(s) cần xử lý.");
            
            for (Order order : orders) {
                // Kiểm tra đã xử lý chưa (tránh trùng)
                if (processedOrderIds.contains(order.getId())) {
                    logger.warning("Order " + order.getId() + " đã được xử lý, bỏ qua.");
                    continue;
                }
                
                // Xử lý order
                processOrder(order);
            }
            
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Lỗi khi poll Supabase: " + e.getMessage(), e);
        }
    }
    
    /**
     * Fetch orders từ Supabase REST API
     */
    private List<Order> fetchOrders() throws Exception {
        String apiUrl = supabaseUrl + "/rest/v1/orders?status=eq.paid&delivered=eq.false&order=created_at.asc";
        
        URL url = new URL(apiUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("apikey", supabaseAnonKey);
        conn.setRequestProperty("Authorization", "Bearer " + supabaseAnonKey);
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Prefer", "return=representation");
        
        int responseCode = conn.getResponseCode();
        
        if (responseCode != HttpURLConnection.HTTP_OK) {
            throw new Exception("HTTP Error: " + responseCode + " - " + conn.getResponseMessage());
        }
        
        // Đọc response
        StringBuilder response = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
        }
        
        // Parse JSON (đơn giản, có thể dùng Gson nếu muốn)
        return parseOrdersJson(response.toString());
    }
    
    /**
     * Parse JSON response thành List<Order>
     * Format: [{"id":"...","mc_username":"...","product":"...","command":"...","status":"paid","delivered":false}]
     */
    private List<Order> parseOrdersJson(String json) {
        List<Order> orders = new ArrayList<>();
        
        try {
            // Loại bỏ dấu ngoặc vuông
            json = json.trim();
            if (json.startsWith("[")) {
                json = json.substring(1);
            }
            if (json.endsWith("]")) {
                json = json.substring(0, json.length() - 1);
            }
            
            // Nếu không có order nào
            if (json.trim().isEmpty()) {
                return orders;
            }
            
            // Split theo },{ để lấy từng order
            String[] orderStrings = json.split("\\},\\{");
            
            for (String orderStr : orderStrings) {
                // Clean up
                orderStr = orderStr.replace("{", "").replace("}", "").trim();
                
                Order order = new Order();
                
                // Parse các field (đơn giản, có thể dùng Gson)
                String[] fields = orderStr.split(",");
                for (String field : fields) {
                    String[] parts = field.split(":", 2);
                    if (parts.length == 2) {
                        String key = parts[0].trim().replace("\"", "");
                        String value = parts[1].trim().replace("\"", "");
                        
                        switch (key) {
                            case "id":
                                order.setId(value);
                                break;
                            case "mc_username":
                                order.setMcUsername(value);
                                break;
                            case "product":
                                order.setProduct(value);
                                break;
                            case "command":
                                order.setCommand(value);
                                break;
                            case "status":
                                order.setStatus(value);
                                break;
                            case "delivered":
                                order.setDelivered(Boolean.parseBoolean(value));
                                break;
                        }
                    }
                }
                
                if (order.getId() != null && !order.getId().isEmpty()) {
                    orders.add(order);
                }
            }
            
        } catch (Exception e) {
            logger.log(Level.WARNING, "Lỗi parse JSON: " + e.getMessage(), e);
        }
        
        return orders;
    }
    
    /**
     * Xử lý một order: thực thi command và update Supabase
     */
    private void processOrder(Order order) {
        logger.info("========================================");
        logger.info("Xử lý order: " + order.getId());
        logger.info("Player: " + order.getMcUsername());
        logger.info("Product: " + order.getProduct());
        logger.info("Command: " + order.getCommand());
        logger.info("========================================");
        
        // Đánh dấu đã xử lý (tránh trùng)
        processedOrderIds.add(order.getId());
        
        // Thực thi command trên main thread (Bukkit yêu cầu)
        Bukkit.getScheduler().runTask(this, () -> {
            try {
                // Thực thi command
                boolean success = Bukkit.dispatchCommand(
                    Bukkit.getConsoleSender(),
                    order.getCommand()
                );
                
                if (success) {
                    logger.info("Command đã được thực thi thành công!");
                    
                    // Update Supabase: set delivered=true và status='delivered'
                    updateOrderStatus(order.getId());
                } else {
                    logger.warning("Command có thể không được thực thi thành công.");
                    // Vẫn update để tránh loop
                    updateOrderStatus(order.getId());
                }
                
            } catch (Exception e) {
                logger.log(Level.SEVERE, "Lỗi khi thực thi command: " + e.getMessage(), e);
            }
        });
    }
    
    /**
     * Update order status trong Supabase
     */
    private void updateOrderStatus(String orderId) {
        Bukkit.getScheduler().runTaskAsynchronously(this, () -> {
            try {
                String apiUrl = supabaseUrl + "/rest/v1/orders?id=eq." + orderId;
                
                URL url = new URL(apiUrl);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("PATCH");
                conn.setRequestProperty("apikey", supabaseAnonKey);
                conn.setRequestProperty("Authorization", "Bearer " + supabaseAnonKey);
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("Prefer", "return=representation");
                conn.setDoOutput(true);
                
                // Body: {"delivered": true, "status": "delivered"}
                String jsonBody = "{\"delivered\":true,\"status\":\"delivered\"}";
                
                try (OutputStream os = conn.getOutputStream()) {
                    byte[] input = jsonBody.getBytes(StandardCharsets.UTF_8);
                    os.write(input, 0, input.length);
                }
                
                int responseCode = conn.getResponseCode();
                
                if (responseCode == HttpURLConnection.HTTP_OK || responseCode == HttpURLConnection.HTTP_NO_CONTENT || responseCode == 204) {
                    logger.info("Order " + orderId + " đã được cập nhật thành công!");
                } else {
                    logger.warning("Lỗi update order " + orderId + ": HTTP " + responseCode);
                    // Đọc error response
                    try (BufferedReader reader = new BufferedReader(
                            new InputStreamReader(conn.getErrorStream(), StandardCharsets.UTF_8))) {
                        String line;
                        StringBuilder error = new StringBuilder();
                        while ((line = reader.readLine()) != null) {
                            error.append(line);
                        }
                        logger.warning("Error response: " + error.toString());
                    }
                }
                
            } catch (Exception e) {
                logger.log(Level.SEVERE, "Lỗi khi update order status: " + e.getMessage(), e);
            }
        });
    }
    
    /**
     * Inner class để lưu thông tin Order
     */
    private static class Order {
        private String id;
        private String mcUsername;
        private String product;
        private String command;
        private String status;
        private boolean delivered;
        
        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getMcUsername() { return mcUsername; }
        public void setMcUsername(String mcUsername) { this.mcUsername = mcUsername; }
        
        public String getProduct() { return product; }
        public void setProduct(String product) { this.product = product; }
        
        public String getCommand() { return command; }
        public void setCommand(String command) { this.command = command; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public boolean isDelivered() { return delivered; }
        public void setDelivered(boolean delivered) { this.delivered = delivered; }
    }
}

