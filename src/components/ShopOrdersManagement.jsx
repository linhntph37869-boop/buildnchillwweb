import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BiCheckCircle, BiXCircle, BiShow, BiRefresh } from 'react-icons/bi';
import { supabase } from '../supabaseClient';

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1458351729023254529/TldcZM4HKMyELK9ZICAO8WXQDcG6vqCtYeSXJZ7NqXRWf1fZP_MRAjfjfkx-qgOrLJgS';

const ShopOrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      let query = supabase
        .from('orders')
        .select('*, products(name, display_price), categories(name)')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      alert('Lỗi khi tải đơn hàng: ' + error.message);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      // Fetch fresh order data to ensure we have the latest notes (msg_id)
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*, products(name, display_price), categories(name)')
        .eq('id', orderId)
        .single();
      
      if (fetchError || !order) throw new Error('Không tìm thấy đơn hàng trong hệ thống!');

      const updateData = { status: newStatus };
      
      if (newStatus === 'paid' && order.command) {
        updateData.paid_at = new Date().toISOString();
        
        // Trích xuất message ID từ ghi chú
        const msgMatch = order.notes?.match(/\[msg_id:(\d+)\]/);
        const discordMsgId = msgMatch ? msgMatch[1] : null;

        // Gửi lệnh vào hàng chờ cho Plugin
        const { error: cmdError } = await supabase
          .from('pending_commands')
          .insert([
            {
              command: order.command,
              mc_username: order.mc_username,
              status: 'pending',
              discord_message_id: discordMsgId
            }
          ]);
        
        if (cmdError) {
          console.error('Error queuing Minecraft command:', cmdError);
        } else {
          // Gửi thông báo chat game - Định dạng: &8[&d&l🪸&8]&d&l BnC-Shop&8→ &a Giao thành công đơn hàng ......&a Cảm ơn bạn đã ủng hộ!
          const notifyMsg = `{"text":"","extra":[{"text":"[","color":"dark_gray"},{"text":"\ud83e\udeb8","color":"light_purple","bold":true},{"text":"]","color":"dark_gray"},{"text":" BnC-Shop","color":"light_purple","bold":true},{"text":" \u2192 ","color":"dark_gray"},{"text":"Giao thành công đơn hàng ","color":"green"},{"text":"${order.product || order.products?.name}","color":"aqua"},{"text":". Cảm ơn bạn đã ủng hộ!","color":"green"}]}`;
          await supabase
            .from('pending_commands')
            .insert([
              {
                command: `tellraw ${order.mc_username} ${notifyMsg}`,
                mc_username: order.mc_username,
                status: 'pending',
                discord_message_id: discordMsgId
              }
            ]);
        }
      }

      if (newStatus === 'delivered') {
        updateData.delivered = true;
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);
      
      if (error) throw error;
      
      // Sync to Discord using fresh order data
      await updateDiscordStatus(order, newStatus);

      loadOrders();
      if (showModal) setShowModal(false);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Lỗi khi cập nhật đơn hàng: ' + error.message);
    }
  };

  const updateDiscordStatus = async (order, newStatus) => {
    const match = order.notes?.match(/\[msg_id:(\d+)\]/);
    if (!match) {
      console.log('No Discord message ID found in notes, skipping sync.');
      return;
    }

    const messageId = match[1];
    const statusLabel = newStatus === 'paid' ? 'ĐÃ THANH TOÁN' : 'ĐÃ GIAO HÀNG';
    const statusColor = newStatus === 'paid' ? 3447003 : 3066993; // Paid: Blue, Delivered: Green

    const embed = {
      title: `🛒 ${statusLabel}`,
      description: newStatus === 'paid' 
        ? `💰 Đơn hàng của **${order.mc_username}** đã được thanh toán thành công và đang chờ giao!`
        : `✅ Đơn hàng của **${order.mc_username}** đã được giao thành công!`,
      color: statusColor,
      fields: [
        { name: '👤 Người chơi', value: order.mc_username || 'Không rõ', inline: true },
        { name: '📦 Sản phẩm', value: order.product || order.products?.name || 'Không rõ', inline: true },
        { name: '💰 Giá tiền', value: `${Number(order.price || 0).toLocaleString('vi-VN')} VNĐ`, inline: true },
        { name: '🆔 Mã đơn hàng', value: `\`${order.id || 'N/A'}\`` },
        { name: '✅ Trạng thái hiện tại', value: `**${statusLabel}**` }
      ],
      footer: { text: 'BuildnChill Shop System - Status Updated' },
      timestamp: new Date().toISOString()
    };

    try {
      console.log(`Updating Discord message ${messageId} to status ${newStatus}...`);
      const response = await fetch(`${DISCORD_WEBHOOK_URL}/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Discord API error:', errorText);
      } else {
        console.log('Discord status updated successfully.');
      }
    } catch (error) {
      console.error('Error updating Discord message:', error);
    }
  };

  const getStatusBadge = (order) => {
    const status = order.status;
    const delivered = order.delivered;
    
    if (delivered) {
      return <span className="badge bg-success">Đã Giao</span>;
    }
    
    const badges = {
      pending: { label: 'Chờ Thanh Toán', class: 'bg-danger' },
      paid: { label: 'Đã Thanh Toán', class: 'bg-success' },
      delivered: { label: 'Đã Giao', class: 'bg-success' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="winter-section-title" style={{ margin: 0 }}>Quản Lý Đơn Hàng</h1>
        <div className="d-flex gap-2">
          <select className="winter-select" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 'auto' }}>
            <option value="all">Tất Cả</option>
            <option value="pending">Chờ Thanh Toán</option>
            <option value="paid">Đã Thanh Toán</option>
            <option value="delivered">Đã Giao</option>
          </select>
          <motion.button
            className="winter-button-outline"
            onClick={loadOrders}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BiRefresh />
          </motion.button>
        </div>
      </div>

      <div className="admin-table">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Người Chơi</th>
              <th>Sản Phẩm</th>
              <th>Giá</th>
              <th>Trạng Thái</th>
              <th>Ngày Tạo</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td style={{ fontSize: '0.85rem' }}>{order.id.substring(0, 8)}...</td>
                <td>{order.mc_username}</td>
                <td>{order.product || order.products?.name}</td>
                <td>{order.price?.toLocaleString('vi-VN')} VNĐ</td>
                <td>{getStatusBadge(order)}</td>
                <td>{new Date(order.created_at).toLocaleString('vi-VN')}</td>
                <td>
                  <motion.button
                    className="winter-button-outline me-2"
                    onClick={() => handleViewOrder(order)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <BiShow />
                  </motion.button>
                  {order.status === 'pending' && (
                    <motion.button
                      className="winter-button-outline"
                      onClick={() => handleUpdateStatus(order.id, 'paid')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ borderColor: '#22c55e', color: '#22c55e' }}
                    >
                      <BiCheckCircle /> Xác Nhận Thanh Toán
                    </motion.button>
                  )}
                  {order.status === 'paid' && (
                    <motion.button
                      className="winter-button-outline"
                      onClick={() => handleUpdateStatus(order.id, 'delivered')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ borderColor: '#0ea5e9', color: '#0ea5e9' }}
                    >
                      <BiCheckCircle /> Xác Nhận Đã Giao
                    </motion.button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedOrder && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999 }} onClick={() => setShowModal(false)}>
          <motion.div className="winter-glass p-4" style={{ maxWidth: '700px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }} initial={{ scale: 0.8 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()}>
            <h3 className="winter-section-title mb-4">Chi Tiết Đơn Hàng</h3>
            <div className="mb-3">
              <strong>ID:</strong> {selectedOrder.id}
            </div>
            <div className="mb-3">
              <strong>Người Chơi:</strong> {selectedOrder.mc_username}
            </div>
            <div className="mb-3">
              <strong>Sản Phẩm:</strong> {selectedOrder.product || selectedOrder.products?.name}
            </div>
            <div className="mb-3">
              <strong>Giá:</strong> {selectedOrder.price?.toLocaleString('vi-VN')} VNĐ
            </div>
            <div className="mb-3">
              <strong>Trạng Thái:</strong> {getStatusBadge(selectedOrder)}
            </div>
            <div className="mb-3">
              <strong>Phương Thức Thanh Toán:</strong> {selectedOrder.payment_method === 'qr' ? 'QR Code' : 'Chuyển Khoản'}
            </div>
            <div className="mb-3">
              <strong>Command:</strong> <code style={{ background: 'rgba(14,165,233,0.1)', padding: '4px 8px', borderRadius: '4px' }}>{selectedOrder.command}</code>
            </div>
            <div className="mb-3">
              <strong>Ngày Tạo:</strong> {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}
            </div>
            {selectedOrder.paid_at && (
              <div className="mb-3">
                <strong>Ngày Thanh Toán:</strong> {new Date(selectedOrder.paid_at).toLocaleString('vi-VN')}
              </div>
            )}
            {selectedOrder.notes && (
              <div className="mb-3">
                <strong>Ghi Chú:</strong> {selectedOrder.notes}
              </div>
            )}
            <div className="d-flex gap-2 mt-4">
              {selectedOrder.status === 'pending' && (
                <motion.button
                  className="winter-button"
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'paid')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <BiCheckCircle className="me-2" />
                  Xác Nhận Thanh Toán & Giao Đồ
                </motion.button>
              )}
              <motion.button
                className="winter-button-outline"
                onClick={() => setShowModal(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <BiXCircle className="me-2" />
                Đóng
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ShopOrdersManagement;

