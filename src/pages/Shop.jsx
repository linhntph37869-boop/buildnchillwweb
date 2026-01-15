import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiShoppingBag, BiUser, BiCheckCircle, BiXCircle, BiGift, BiCreditCard, BiStar } from 'react-icons/bi';
import { supabase } from '../supabaseClient';
import SnowEffect from '../components/SnowEffect';
import '../styles/shop-winter.css';
// import { QRCodeCanvas } from 'qrcode.react'; // Bạn chưa dùng component này, có thể comment lại để tránh warning

const Shop = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    mc_username: '',
    product_id: '',
    payment_method: 'qr'
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState({
    qr_code: '',
    bank_account: '',
    bank_name: '',
    account_name: ''
  });
  const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1458351729023254529/TldcZM4HKMyELK9ZICAO8WXQDcG6vqCtYeSXJZ7NqXRWf1fZP_MRAjfjfkx-qgOrLJgS'; 

  const sendDiscordNotification = async (order, customTitle) => {
    if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL.includes('Thay bằng URL thật')) return null;

    try {
      const isSuccess = customTitle === 'THANH TOÁN THÀNH CÔNG';
      const embed = {
        title: `🛒 ${customTitle || 'ĐƠN HÀNG MỚI'}`,
        description: `🔔 <@741299302495813662> ${isSuccess ? 'Người chơi đã xác nhận đã thanh toán xong! Admin vui lòng kiểm tra ngân hàng.' : 'Có một đơn hàng mới vừa được khởi tạo trên hệ thống!'}`,
        color: 16766720,
        fields: [
          { name: '👤 Người chơi', value: order.mc_username || 'Không rõ', inline: true },
          { name: '📦 Sản phẩm', value: order.product || 'Không rõ', inline: true },
          { name: '💰 Giá tiền', value: `${Number(order.price || 0).toLocaleString('vi-VN')} VNĐ`, inline: true },
          { name: '💳 Thanh toán', value: order.payment_method === 'qr' ? 'QR Code' : 'Chuyển Khoản', inline: true },
          { name: '🆔 Mã đơn hàng', value: `\`${order.id || 'N/A'}\`` },
          { name: '📜 Lệnh thực thi', value: `\`${order.command || 'N/A'}\`` }
        ],
        footer: { text: 'BuildnChill Shop System' },
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${DISCORD_WEBHOOK_URL}?wait=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🔔 <@741299302495813662> **${isSuccess ? 'XÁC NHẬN THANH TOÁN' : 'ĐƠN HÀNG MỚI'}**`,
          embeds: [embed]
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.id;
      }
      return null;
    } catch (error) {
      console.error('Error sending Discord notification:', error);
      return null;
    }
  };

  useEffect(() => {
    document.title = 'Cửa Hàng - BuildnChill Minecraft';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Mua sắm vật phẩm, rank và các gói hỗ trợ tại cửa hàng BuildnChill Minecraft. Thanh toán tiện lợi qua QR Code.');
    }
    loadCategories();
    loadProducts();
    loadPaymentInfo();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true });
      
      const cats = data || [];
      setCategories(cats);
      if (cats.length > 0 && !selectedCategory) {
        setSelectedCategory(cats[0].id);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadPaymentInfo = async () => {
    setPaymentInfo({
      qr_code: '',
      bank_account: '0379981206',
      bank_name: 'MBBank',
      account_name: 'LE DUC TRONG'
    });
  };

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category_id === selectedCategory)
    : products;

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedProduct(null);
    setFormData({ ...formData, product_id: '' });
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setFormData({ ...formData, product_id: product.id });
    
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  // --- PHẦN ĐÃ SỬA LỖI Ở ĐÂY ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.mc_username.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập tên Minecraft của bạn!' });
      return;
    }

    if (!formData.product_id) {
      setMessage({ type: 'error', text: 'Vui lòng chọn sản phẩm!' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const product = products.find(p => p.id === formData.product_id);
      if (!product) {
        setMessage({ type: 'error', text: 'Sản phẩm không hợp lệ!' });
        setSubmitting(false);
        return;
      }

      // Tạo order với status='pending' (chưa thanh toán)
      const tempId = crypto.randomUUID();
      const newOrder = {
        id: tempId,
        mc_username: formData.mc_username.trim(),
        product: product.name,
        product_id: product.id,
        category_id: product.category_id,
        command: product.command.replace('{username}', formData.mc_username.trim()),
        price: product.price,
        status: 'pending',
        delivered: false,
        payment_method: formData.payment_method
      };

      localStorage.setItem('last_mc_username', formData.mc_username.trim());
      setCurrentOrder(newOrder);
      setShowPayment(true);
      setMessage({ 
        type: 'success', 
        text: 'Vui lòng hoàn tất thanh toán trong bảng hiện ra!' 
      });
      
    } catch (error) {
      console.error('Unexpected error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau!' 
      });
    } finally {
      setSubmitting(false);
    }
  };
  // -----------------------------

  const handlePaymentComplete = async () => {
    if (!currentOrder || submitting) return;
    
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            id: currentOrder.id,
            mc_username: currentOrder.mc_username,
            product: currentOrder.product,
            product_id: currentOrder.product_id,
            category_id: currentOrder.category_id,
            command: currentOrder.command,
            price: currentOrder.price,
            status: 'pending',
            delivered: false,
            payment_method: currentOrder.payment_method,
            notes: 'Người chơi đã bấm nút "Đã Thanh Toán" trên web'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const messageId = await sendDiscordNotification(data, 'THANH TOÁN THÀNH CÔNG');
      
      if (messageId) {
        await supabase
          .from('orders')
          .update({ 
            notes: `Người chơi đã bấm nút "Đã Thanh Toán" trên web [msg_id:${messageId}]`
          })
          .eq('id', data.id);
      }

      setShowPayment(false);
      setShowSuccess(true);
      setFormData({ mc_username: '', product_id: '', payment_method: 'qr' });
      setSelectedProduct(null);
      setCurrentOrder(null);
      
    } catch (error) {
      console.error('Error completing payment:', error);
      alert('Có lỗi xảy ra khi gửi đơn hàng. Vui lòng thử lại hoặc liên hệ Admin!');
    } finally {
      setSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="shop-winter-container">
      <SnowEffect />
      <div className="container my-5">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="winter-title mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <BiShoppingBag className="me-2" style={{ display: 'inline-block' }} />
            Cửa Hàng Minecraft
          </motion.h1>
          <motion.p 
            className="winter-subtitle mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            ❄️ Mua sắm mùa đông, rước lộc đầy kho! ❄️
          </motion.p>

          <AnimatePresence>
            {showPayment && currentOrder && (
              <motion.div
                className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.7)', 
                  zIndex: 9999 
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPayment(false)}
              >
                <motion.div
                  className="winter-glass p-4"
                  style={{ maxWidth: '500px', width: '90%' }}
                  initial={{ scale: 0.8, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.8, y: 50 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="winter-section-title mb-3">
                    <BiCreditCard /> Thanh Toán
                  </h3>
                  
                  <div className="mb-3">
                    <strong style={{ color: 'var(--winter-blue-dark)' }}>Sản phẩm:</strong> {currentOrder.product}
                  </div>
                  <div className="mb-3">
                    <strong style={{ color: 'var(--winter-blue-dark)' }}>Giá:</strong> {currentOrder.price?.toLocaleString('vi-VN')} VNĐ
                  </div>

                  {formData.payment_method === 'qr' ? (
                    <div className="text-center mb-3">
                      <p className="mb-2">Quét mã QR để thanh toán:</p>
                      <div className="d-flex justify-content-center mb-3">
                        <img 
                          src={`https://img.vietqr.io/image/MB-${paymentInfo.bank_account}-compact2.png?amount=${currentOrder.price}&addInfo=${currentOrder.id.substring(0, 8)}&accountName=${paymentInfo.account_name}`}
                          alt="VietQR Payment"
                          style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                      </div>
                      <p className="small text-muted">Tự động điền số tiền và nội dung chuyển khoản</p>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <p className="mb-2"><strong>Thông tin chuyển khoản:</strong></p>
                      <div className="p-3" style={{ background: 'rgba(14, 165, 233, 0.1)', borderRadius: '8px' }}>
                        <p className="mb-1"><strong>Ngân hàng:</strong> {paymentInfo.bank_name}</p>
                        <p className="mb-1"><strong>Số tài khoản:</strong> {paymentInfo.bank_account}</p>
                        <p className="mb-0"><strong>Chủ tài khoản:</strong> {paymentInfo.account_name}</p>
                        <p className="mb-0 mt-2"><strong>Số tiền:</strong> {currentOrder.price?.toLocaleString('vi-VN')} VNĐ</p>
                        <p className="mb-0"><strong>Nội dung:</strong> {currentOrder.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  )}

                  <div className="d-flex gap-2">
                    <motion.button
                      className="winter-button"
                      onClick={handlePaymentComplete}
                      disabled={submitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {submitting ? 'Đang Xử Lý...' : 'Đã Thanh Toán'}
                    </motion.button>
                    <motion.button
                      className="winter-button-outline"
                      onClick={() => setShowPayment(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Hủy
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.7)', 
                  zIndex: 9999 
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSuccess(false)}
              >
                <motion.div
                  className="winter-glass p-5 text-center"
                  style={{ maxWidth: '500px', width: '90%' }}
                  initial={{ scale: 0.8, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.8, y: 50 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, delay: 0.2 }}
                  >
                    <BiCheckCircle size={100} color="#22c55e" className="mb-4" />
                  </motion.div>
                  <h2 className="winter-title mb-3" style={{ fontSize: '2rem' }}>Thanh Toán Thành Công!</h2>
                  <p className="mb-4" style={{ fontSize: '1.1rem', color: 'var(--winter-text)' }}>
                    Cảm ơn bạn đã mua sắm tại BuildnChill. <br />
                    Vui lòng chờ admin xác nhận thanh toán. Bạn sẽ nhận được sản phẩm trong game ngay sau đó! 🎊
                  </p>
                  <motion.button
                    className="winter-button w-100"
                    onClick={() => setShowSuccess(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Tuyệt vời!
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="row">
            <motion.div 
              className="col-lg-3 mb-4"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="winter-glass p-3">
                <h4 className="winter-section-title mb-3" style={{ fontSize: '1.25rem' }}>
                  Danh Mục
                </h4>
                <div className="d-flex flex-column gap-2">
                  {categories.map(category => (
                    <motion.button
                      key={category.id}
                      className="winter-button"
                      style={{ 
                        background: selectedCategory === category.id ? 'var(--winter-blue)' : 'transparent',
                        border: '2px solid var(--winter-blue)',
                        color: selectedCategory === category.id ? 'white' : 'var(--winter-blue)',
                        textAlign: 'left',
                        justifyContent: 'flex-start'
                      }}
                      onClick={() => handleCategoryChange(category.id)}
                      whileHover={{ scale: 1.02 }}
                    >
                      {category.icon} {category.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="col-lg-9"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="row g-4">
                {filteredProducts.map((product) => (
                  <motion.div 
                    key={product.id}
                    className="col-md-6 col-lg-4"
                    variants={itemVariants}
                  >
                    <motion.div 
                      className={`winter-card h-100 ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                      whileHover={{ y: -5, scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => handleProductSelect(product)}
                    >
                      {product.image_url && (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          style={{ 
                            width: '100%', 
                            height: '200px', 
                            objectFit: 'cover',
                            borderRadius: '12px 12px 0 0',
                            marginBottom: '1rem'
                          }}
                        />
                      )}
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <BiStar style={{ color: 'var(--winter-blue)', fontSize: '1.2rem' }} />
                          <h5 style={{ color: 'var(--winter-text)', fontWeight: 700, margin: 0 }}>
                            {product.name}
                          </h5>
                        </div>
                      </div>
                      <p style={{ color: 'var(--winter-text)', marginBottom: '1rem', minHeight: '40px' }}>
                        {product.description}
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="winter-badge" style={{ fontSize: '1.1rem', padding: '0.75rem 1.25rem' }}>
                          {product.display_price || product.price?.toLocaleString('vi-VN') + ' VNĐ'}
                        </span>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-5">
                  <p style={{ color: 'var(--winter-text)', fontSize: '1.2rem' }}>
                    Không có sản phẩm nào trong danh mục này.
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {selectedProduct && (
            <motion.div 
              ref={formRef}
              className="mt-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="winter-glass winter-glass-strong p-4">
                <h3 className="winter-section-title mb-4">
                  <BiGift className="me-2" />
                  Đặt Hàng
                </h3>
                
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <label htmlFor="mc_username" className="winter-label">
                        <BiUser />
                        Tên Minecraft (IGN)
                      </label>
                      <input
                        type="text"
                        className="winter-input"
                        id="mc_username"
                        name="mc_username"
                        value={formData.mc_username}
                        onChange={handleChange}
                        placeholder="Nhập tên Minecraft của bạn..."
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="col-md-6 mb-4">
                      <label htmlFor="payment_method" className="winter-label">
                        <BiCreditCard />
                        Phương Thức Thanh Toán
                      </label>
                      <select
                        className="winter-select"
                        id="payment_method"
                        name="payment_method"
                        value={formData.payment_method}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                      >
                        <option value="qr">QR Code</option>
                        <option value="bank">Chuyển Khoản</option>
                      </select>
                    </div>
                  </div>

                  {selectedProduct && (
                    <div className="winter-preview mb-4">
                      <strong style={{ color: 'var(--winter-blue-dark)', display: 'block', marginBottom: '0.5rem' }}>
                        ✨ Sản phẩm đã chọn:
                      </strong>
                      <p className="mb-1" style={{ color: 'var(--winter-text)', fontWeight: 600, fontSize: '1.1rem' }}>
                        {selectedProduct.name}
                      </p>
                      <p className="mb-0" style={{ color: 'var(--winter-text)' }}>
                        {selectedProduct.description}
                      </p>
                      <p className="mt-2 mb-0" style={{ color: 'var(--winter-blue-dark)', fontWeight: 700, fontSize: '1.2rem' }}>
                        Giá: {selectedProduct.display_price || selectedProduct.price?.toLocaleString('vi-VN') + ' VNĐ'}
                      </p>
                    </div>
                  )}

                  {message.text && (
                    <motion.div 
                      className={`winter-message mb-4 ${message.type === 'success' ? 'success' : 'error'}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {message.type === 'success' ? (
                        <BiCheckCircle size={20} />
                      ) : (
                        <BiXCircle size={20} />
                      )}
                      <span>{message.text}</span>
                    </motion.div>
                  )}

                  <motion.button 
                    type="submit" 
                    className="winter-button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="winter-loading me-2"></span>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <BiGift className="me-2" style={{ display: 'inline-block' }} />
                        Đặt Hàng
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Shop;
