import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useData } from '../context/DataContext';
import RichTextEditor from '../components/RichTextEditor';
import SnowEffect from '../components/SnowEffect';
import ShopCategoriesManagement from '../components/ShopCategoriesManagement';
import ShopProductsManagement from '../components/ShopProductsManagement';
import ShopOrdersManagement from '../components/ShopOrdersManagement';
import '../styles/winter-theme.css';
import { 
  BiBarChart, 
  BiNews, 
  BiServer, 
  BiCog, 
  BiPlus, 
  BiEdit, 
  BiTrash,
  BiLogOutCircle,
  BiCheckCircle,
  BiXCircle,
  BiEnvelope,
  BiCheck,
  BiImage,
  BiShoppingBag
} from 'react-icons/bi';

const Admin = () => {
  const navigate = useNavigate();
  const { 
    news, 
    serverStatus, 
    contacts,
    siteSettings,
    isAuthenticated, 
    logout,
    addNews, 
    updateNews, 
    deleteNews,
    updateServerStatus,
    updateSiteSettings,
    markContactAsRead,
    updateContactStatus,
    deleteContact
  } = useData();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [serverForm, setServerForm] = useState({
    status: 'Online',
    players: '',
    maxPlayers: '500',
    version: '1.20.4'
  });
  const [settingsForm, setSettingsForm] = useState({
    server_ip: '',
    server_version: '',
    contact_email: '',
    contact_phone: '',
    discord_url: '',
    site_title: ''
  });
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [stats, setStats] = useState({
    pendingOrders: 0,
    monthlyOrders: 0,
    yearlyOrders: 0,
    totalOrders: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    totalRevenue: 0,
    revenueByDay: [],
    topProducts: []
  });

  const loadDashboardStats = async () => {
    try {
      const { data: allOrders, error } = await supabase
        .from('orders')
        .select('created_at, price, status, delivered, product');
      
      if (error) throw error;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const pending = allOrders.filter(o => o.status === 'paid' && !o.delivered).length;
      
      let mOrders = 0;
      let yOrders = 0;
      let tOrders = allOrders.length;
      let mRevenue = 0;
      let yRevenue = 0;
      let tRevenue = 0;
      
      const productCounts = {};
      
      // For chart: Last 7 days
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return {
          date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          revenue: 0,
          fullDate: d.toISOString().split('T')[0]
        };
      }).reverse();

      allOrders.forEach(order => {
        const orderDate = new Date(order.created_at);
        const isPaid = order.status === 'paid' || order.status === 'delivered' || order.delivered;
        const price = order.price || 0;

        if (isPaid) {
          tRevenue += price;
          // Count top products
          const pName = order.product || 'Ẩn danh';
          productCounts[pName] = (productCounts[pName] || 0) + 1;
        }
        
        if (orderDate.getFullYear() === currentYear) {
          yOrders++;
          if (isPaid) yRevenue += price;
          
          if (orderDate.getMonth() === currentMonth) {
            mOrders++;
            if (isPaid) mRevenue += price;
          }
        }

        // Daily revenue for chart
        const dateStr = orderDate.toISOString().split('T')[0];
        const dayStat = last7Days.find(d => d.fullDate === dateStr);
        if (dayStat && isPaid) {
          dayStat.revenue += price;
        }
      });

      // Format top products
      const topProducts = Object.entries(productCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        pendingOrders: pending,
        monthlyOrders: mOrders,
        yearlyOrders: yOrders,
        totalOrders: tOrders,
        monthlyRevenue: mRevenue,
        yearlyRevenue: yRevenue,
        totalRevenue: tRevenue,
        revenueByDay: last7Days,
        topProducts
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  useEffect(() => {
    document.title = 'Bảng Điều Khiển Quản Trị - BuildnChill';
    if (isAuthenticated) {
      loadDashboardStats();
    }
  }, [isAuthenticated]);

  const statusOptions = [
    { value: 'pending', label: '🔴 Đã Nhận', color: '#ef4444' },
    { value: 'processing', label: '🟡 Đang Kiểm Tra', color: '#f59e0b' },
    { value: 'resolved', label: '🟢 Đã Giải Quyết', color: '#10b981' }
  ];

  const categoryLabels = {
    report: 'Báo Cáo',
    help: 'Trợ Giúp',
    bug: 'Báo Lỗi',
    suggestion: 'Đề Xuất',
    other: 'Khác'
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setServerForm({
      status: serverStatus?.status || 'Online',
      players: serverStatus?.players || '0',
      maxPlayers: serverStatus?.maxPlayers || '500',
      version: serverStatus?.version || '1.20.4'
    });
    if (siteSettings) {
      setSettingsForm({
        server_ip: siteSettings.server_ip || '',
        server_version: siteSettings.server_version || '',
        contact_email: siteSettings.contact_email || '',
        contact_phone: siteSettings.contact_phone || '',
        discord_url: siteSettings.discord_url || '',
        site_title: siteSettings.site_title || ''
      });
    }
  }, [isAuthenticated, navigate, serverStatus, siteSettings]);

  // Notification for new contacts
  const unreadCount = contacts.filter(c => !c.read).length;
  const pendingCount = contacts.filter(c => c.status === 'pending' || !c.status).length;
  const processingCount = contacts.filter(c => c.status === 'processing').length;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleServerChange = (e) => {
    const { name, value, type, checked } = e.target;
    setServerForm({
      ...serverForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettingsForm({
      ...settingsForm,
      [name]: value
    });
  };

  const handleSettingsSave = async () => {
    try {
      const success = await updateSiteSettings(settingsForm);
      if (success) {
        alert('Đã cập nhật cài đặt thành công!');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };


  const handleAddNew = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      content: '',
      image: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setShowModal(true);
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      image: post.image,
      date: post.date,
      description: post.description
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingPost) {
        const updatedPost = { ...editingPost, ...formData };
        const success = await updateNews(editingPost.id, updatedPost);
        if (success) {
          setShowModal(false);
          setEditingPost(null);
        }
      } else {
        const success = await addNews(formData);
        if (success) {
          setShowModal(false);
          setEditingPost(null);
        }
      }
    } catch (error) {
      console.error('Error saving news:', error);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
      await deleteNews(postId);
    }
  };

  const handleServerSave = async () => {
    try {
      const success = await updateServerStatus(serverForm);
      if (success) {
        alert('Đã cập nhật trạng thái server thành công!');
      }
    } catch (error) {
      console.error('Error updating server status:', error);
    }
  };


  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  const tabs = [
    { id: 'dashboard', label: 'Bảng Điều Khiển', icon: BiBarChart },
    { id: 'categories', label: 'Danh Mục', icon: BiCog },
    { id: 'products', label: 'Sản Phẩm', icon: BiShoppingBag },
    { id: 'orders', label: 'Đơn Hàng', icon: BiCheckCircle },
    { id: 'news', label: 'Tin Tức', icon: BiNews },
    { id: 'contacts', label: 'Liên Hệ', icon: BiEnvelope },
    { id: 'server', label: 'Trạng Thái Server', icon: BiServer },
    { id: 'settings', label: 'Cài Đặt', icon: BiCog }
  ];

  return (
    <div className="winter-container" style={{ minHeight: '100vh' }}>
      <SnowEffect />
      {/* Top Navigation Bar (for screens < 992px) */}
      <div className="admin-top-nav d-lg-none">
        <div className="admin-top-nav-header">
          <h4 style={{ 
            color: 'var(--winter-blue)',
            fontWeight: 800,
            margin: 0,
            textShadow: '0 0 15px rgba(14, 165, 233, 0.4)',
            fontSize: '1.3rem',
            fontFamily: "'Poppins', sans-serif"
          }}>{siteSettings?.site_title || 'BuildnChill'} Admin</h4>
        </div>
        <nav className="admin-top-nav-menu">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const hasNotification = tab.id === 'contacts' && (unreadCount > 0 || pendingCount > 0 || processingCount > 0);
            return (
              <motion.button
                key={tab.id}
                className={`admin-top-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ position: 'relative' }}
              >
                <Icon size={18} />
                <span className="admin-top-nav-label">{tab.label}</span>
                {hasNotification && (
                  <span style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    backgroundColor: '#dc2626',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 'bold'
                  }}>
                    {unreadCount + pendingCount + processingCount > 9 ? '9+' : unreadCount + pendingCount + processingCount}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>
        <div className="admin-top-nav-footer">
          <motion.button
            className="winter-button w-100"
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ fontSize: '0.85rem', padding: '8px 16px' }}
          >
            <BiLogOutCircle className="me-2" />
            Đăng Xuất
          </motion.button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="d-flex d-lg-flex" style={{ minHeight: '100vh' }}>
        {/* Sidebar (Desktop only - >= 992px) */}
        <motion.div 
          className="admin-sidebar d-none d-lg-block"
          style={{ width: '250px' }}
        >
          <div className="p-3 mb-4">
            <h4 style={{ 
              color: 'var(--winter-blue)',
              fontWeight: 800,
              margin: 0,
              textShadow: '0 0 15px rgba(14, 165, 233, 0.4)',
              fontSize: '1.2rem',
              fontFamily: "'Poppins', sans-serif"
            }}>{siteSettings?.site_title || 'BuildnChill'} Admin</h4>
          </div>
          <nav className="nav flex-column">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const hasNotification = tab.id === 'contacts' && (unreadCount > 0 || pendingCount > 0 || processingCount > 0);
              return (
                <motion.button
                  key={tab.id}
                  className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ position: 'relative' }}
                >
                  <Icon size={20} />
                  {tab.label}
                  {hasNotification && (
                    <span style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: '#dc2626',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {unreadCount + pendingCount + processingCount > 9 ? '9+' : unreadCount + pendingCount + processingCount}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </nav>
          <div className="p-3 mt-auto">
            <motion.button
              className="winter-button w-100"
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BiLogOutCircle className="me-2" />
              Đăng Xuất
            </motion.button>
          </div>
        </motion.div>

        {/* Content */}
        <div className="admin-content flex-grow-1">
          <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="winter-section-title" style={{ wordWrap: 'break-word', margin: 0 }}>Bảng Điều Khiển</h1>
                <motion.button 
                  className="winter-button-outline" 
                  onClick={loadDashboardStats}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BiServer className="me-2" /> Làm mới dữ liệu
                </motion.button>
              </div>

              {/* Stats Cards */}
              <div className="row g-3 g-md-4 mb-5">
                <div className="col-12 col-sm-6 col-md-4 col-lg">
                  <div className="admin-card glass" style={{ borderLeft: '4px solid #ef4444' }}>
                    <h3 style={{ color: '#ef4444', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                      {stats.pendingOrders}
                    </h3>
                    <p style={{ color: '#1a1a1a', fontWeight: 600, fontSize: '0.9rem' }}>Đơn Chờ Giao</p>
                    <small className="text-muted">Đã thanh toán</small>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg">
                  <div className="admin-card glass" style={{ borderLeft: '4px solid var(--winter-blue)' }}>
                    <h3 style={{ color: 'var(--winter-blue-dark)', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                      {stats.monthlyRevenue?.toLocaleString('vi-VN')} <span style={{ fontSize: '1rem' }}>VNĐ</span>
                    </h3>
                    <p style={{ color: '#1a1a1a', fontWeight: 600, fontSize: '0.9rem' }}>Doanh Thu Tháng</p>
                    <small className="text-muted">{stats.monthlyOrders} đơn</small>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg">
                  <div className="admin-card glass" style={{ borderLeft: '4px solid #10b981' }}>
                    <h3 style={{ color: '#10b981', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                      {stats.yearlyRevenue?.toLocaleString('vi-VN')} <span style={{ fontSize: '1rem' }}>VNĐ</span>
                    </h3>
                    <p style={{ color: '#1a1a1a', fontWeight: 600, fontSize: '0.9rem' }}>Doanh Thu Năm</p>
                    <small className="text-muted">{stats.yearlyOrders} đơn</small>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg">
                  <div className="admin-card glass" style={{ borderLeft: '4px solid #8b5cf6' }}>
                    <h3 style={{ color: '#8b5cf6', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                      {stats.totalRevenue?.toLocaleString('vi-VN')} <span style={{ fontSize: '1rem' }}>VNĐ</span>
                    </h3>
                    <p style={{ color: '#1a1a1a', fontWeight: 600, fontSize: '0.9rem' }}>Tổng Doanh Thu</p>
                    <small className="text-muted">Tất cả thời gian</small>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg">
                  <div className="admin-card glass" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <h3 style={{ color: '#f59e0b', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                      {serverStatus?.players || 0}
                    </h3>
                    <p style={{ color: '#1a1a1a', fontWeight: 600, fontSize: '0.9rem' }}>Online</p>
                    <small className="text-muted">Người chơi</small>
                  </div>
                </div>
              </div>

              {/* Revenue Chart Section */}
              <div className="row g-4">
                <div className="col-12 col-lg-8">
                  <div className="admin-card glass p-4 h-100">
                    <h5 className="mb-4" style={{ color: 'var(--winter-blue-dark)', fontWeight: 700 }}>Doanh Thu 7 Ngày Gần Nhất</h5>
                    <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 20px 40px 20px', position: 'relative', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                      {stats.revenueByDay.map((day, index) => {
                        const maxRevenue = Math.max(...stats.revenueByDay.map(d => d.revenue), 100000);
                        const height = (day.revenue / maxRevenue) * 200;
                        return (
                          <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12%', position: 'relative' }}>
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${height}px` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              style={{ 
                                width: '100%', 
                                background: 'linear-gradient(to top, var(--winter-blue), var(--winter-blue-light))',
                                borderRadius: '4px 4px 0 0',
                                cursor: 'pointer',
                                position: 'relative'
                              }}
                              title={`${day.revenue.toLocaleString('vi-VN')} VNĐ`}
                            >
                              {day.revenue > 0 && (
                                <span style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap', color: 'var(--winter-blue-dark)' }}>
                                  {Math.round(day.revenue / 1000)}k
                                </span>
                              )}
                            </motion.div>
                            <span style={{ position: 'absolute', bottom: '-30px', fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>{day.date}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="col-12 col-lg-4">
                  <div className="admin-card glass p-4 h-100">
                    <h5 className="mb-4" style={{ color: 'var(--winter-blue-dark)', fontWeight: 700 }}>Sản phẩm bán chạy</h5>
                    <ul className="list-unstyled mb-4">
                      {stats.topProducts.length === 0 ? (
                        <li className="text-muted small">Chưa có dữ liệu bán hàng</li>
                      ) : (
                        stats.topProducts.map((p, i) => (
                          <li key={i} className="mb-2 d-flex justify-content-between align-items-center p-2 rounded" style={{ background: 'rgba(14, 165, 233, 0.05)', borderLeft: '3px solid var(--winter-blue)' }}>
                            <span style={{ fontWeight: 500, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                              {i+1}. {p.name}
                            </span>
                            <span className="badge bg-info rounded-pill">{p.count} đơn</span>
                          </li>
                        ))
                      )}
                    </ul>

                    <h5 className="mb-4" style={{ color: 'var(--winter-blue-dark)', fontWeight: 700 }}>Tổng Quan Khác</h5>
                    <ul className="list-unstyled">
                      <li className="mb-3 d-flex justify-content-between align-items-center p-2 rounded" style={{ background: 'rgba(255,255,255,0.5)' }}>
                        <span style={{ fontWeight: 500 }}>Bài viết tin tức</span>
                        <span className="badge bg-primary rounded-pill">{news.length}</span>
                      </li>
                      <li className="mb-3 d-flex justify-content-between align-items-center p-2 rounded" style={{ background: 'rgba(255,255,255,0.5)' }}>
                        <span style={{ fontWeight: 500 }}>Liên hệ chưa đọc</span>
                        <span className="badge bg-danger rounded-pill">{unreadCount}</span>
                      </li>
                      <li className="mb-3 d-flex justify-content-between align-items-center p-2 rounded" style={{ background: 'rgba(255,255,255,0.5)' }}>
                        <span style={{ fontWeight: 500 }}>Liên hệ chờ xử lý</span>
                        <span className="badge bg-warning rounded-pill">{pendingCount}</span>
                      </li>
                      <li className="mb-3 d-flex justify-content-between align-items-center p-2 rounded" style={{ background: 'rgba(255,255,255,0.5)' }}>
                        <span style={{ fontWeight: 500 }}>Liên hệ đang kiểm tra</span>
                        <span className="badge bg-info rounded-pill">{processingCount}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'news' && (
            <motion.div
              key="news"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                <h1 className="winter-section-title" style={{ wordWrap: 'break-word', margin: 0 }}>Quản Lý Tin Tức</h1>
                <motion.button
                  className="winter-button"
                  onClick={handleAddNew}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  <BiPlus className="me-2" />
                  Thêm
                </motion.button>
              </div>

              <div className="admin-table glass">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tiêu Đề</th>
                      <th>Ngày</th>
                      <th>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {news.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center" style={{ color: '#1a1a1a', padding: '2rem', fontWeight: 500 }}>
                          Chưa có bài viết nào
                        </td>
                      </tr>
                    ) : (
                      news.map((post) => (
                        <motion.tr
                          key={post.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          whileHover={{ backgroundColor: 'rgba(220, 38, 38, 0.05)' }}
                        >
                          <td style={{ wordWrap: 'break-word', maxWidth: '300px', color: '#0a0a0a', fontWeight: 500 }}>{post.title}</td>
                          <td style={{ whiteSpace: 'nowrap', color: '#1a1a1a', fontWeight: 500 }}>{new Date(post.date).toLocaleDateString('vi-VN')}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <motion.button
                              className="winter-button-outline me-2"
                              style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                              onClick={() => handleEdit(post)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <BiEdit className="me-1" />
                              Sửa
                            </motion.button>
                            <motion.button
                              className="winter-button-outline"
                              style={{ 
                                padding: '0.25rem 0.75rem', 
                                fontSize: '0.875rem',
                                borderColor: '#f97316',
                                color: '#f97316'
                              }}
                              onClick={() => handleDelete(post.id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <BiTrash className="me-1" />
                              Xóa
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'contacts' && (
            <motion.div
              key="contacts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                <h1 className="winter-section-title" style={{ wordWrap: 'break-word', margin: 0 }}>Tin Nhắn Liên Hệ</h1>
                <div style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
                  <span style={{ color: '#0a0a0a', fontWeight: 600 }}>
                    Tổng: {contacts.length} | 
                    Chưa đọc: {unreadCount} | 
                    Đã nhận: {pendingCount} | 
                    Đang kiểm tra: {processingCount}
                  </span>
                </div>
              </div>

              <div className="admin-table glass">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tên Game</th>
                      <th>Email</th>
                      <th>Danh Mục</th>
                      <th>Ảnh</th>
                      <th>Ngày</th>
                      <th>Trạng Thái</th>
                      <th>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center" style={{ color: '#1a1a1a', padding: '2rem', fontWeight: 500 }}>
                          Chưa có liên hệ nào
                        </td>
                      </tr>
                    ) : (
                      contacts.map((contact) => {
                        const currentStatus = statusOptions.find(s => s.value === (contact.status || 'pending'));
                        return (
                          <motion.tr
                            key={contact.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            whileHover={{ backgroundColor: 'rgba(220, 38, 38, 0.05)' }}
                            style={{ 
                              backgroundColor: contact.read ? 'transparent' : 'rgba(251, 191, 36, 0.1)',
                              borderLeft: contact.read ? 'none' : '3px solid #fbbf24'
                            }}
                          >
                            <td style={{ fontWeight: contact.read ? '500' : '700', wordWrap: 'break-word', maxWidth: '150px', color: '#0a0a0a' }}>
                              {contact.ign}
                            </td>
                            <td style={{ wordWrap: 'break-word', maxWidth: '200px' }}>
                              <a href={`mailto:${contact.email}`} style={{ color: 'var(--winter-blue)', wordBreak: 'break-all', fontWeight: 500 }}>
                                {contact.email}
                              </a>
                            </td>
                            <td style={{ wordWrap: 'break-word', maxWidth: '120px' }}>
                              <span style={{ 
                                padding: '0.25rem 0.5rem', 
                                borderRadius: '4px', 
                                backgroundColor: 'rgba(217, 119, 6, 0.2)',
                                color: 'var(--winter-blue)',
                                fontSize: '0.875rem',
                                fontWeight: 600
                              }}>
                                {categoryLabels[contact.category] || 'Khác'}
                              </span>
                            </td>
                            <td style={{ wordWrap: 'break-word' }}>
                              {contact.image_url ? (
                                <motion.button
                                  onClick={() => {
                                    setSelectedContact(contact);
                                    setShowContactModal(true);
                                  }}
                                  style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    padding: 0,
                                    cursor: 'pointer'
                                  }}
                                  whileHover={{ scale: 1.1 }}
                                >
                                  <BiImage size={24} style={{ color: 'var(--winter-blue)' }} />
                                </motion.button>
                              ) : (
                                <span style={{ color: '#6b7280' }}>-</span>
                              )}
                            </td>
                            <td style={{ whiteSpace: 'nowrap', color: '#1a1a1a', fontWeight: 500 }}>
                              {new Date(contact.created_at).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              <select
                                value={contact.status || 'pending'}
                                onChange={(e) => updateContactStatus(contact.id, e.target.value)}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  border: `1px solid ${currentStatus?.color || 'var(--winter-blue)'}`,
                                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                  color: currentStatus?.color || 'var(--winter-blue)',
                                  fontSize: '0.875rem',
                                  cursor: 'pointer'
                                }}
                              >
                                {statusOptions.map(opt => (
                                  <option key={opt.value} value={opt.value} style={{ backgroundColor: '#1a1a1a', color: opt.color }}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              <motion.button
                                className="winter-button-outline me-2 mb-2 mb-md-0"
                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}
                                onClick={() => {
                                  setSelectedContact(contact);
                                  setShowContactModal(true);
                                  if (!contact.read) {
                                    markContactAsRead(contact.id);
                                  }
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <BiCheck className="me-1" />
                                Xem
                              </motion.button>
                              <motion.button
                                className="winter-button-outline"
                                style={{ 
                                  padding: '0.25rem 0.75rem', 
                                  fontSize: '0.875rem',
                                  borderColor: '#f97316',
                                  color: '#f97316',
                                  whiteSpace: 'nowrap'
                                }}
                                onClick={async () => {
                                  if (window.confirm('Bạn có chắc muốn xóa liên hệ này?')) {
                                    await deleteContact(contact.id);
                                  }
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <BiTrash className="me-1" />
                                Xóa
                              </motion.button>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'server' && (
            <motion.div
              key="server"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="winter-section-title mb-4" style={{ wordWrap: 'break-word' }}>Trạng Thái Server</h1>
              <div className="admin-card glass">
                <div className="mb-4">
                  <label className="form-label">Trạng Thái Server</label>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="status"
                      checked={serverForm.status === 'Online'}
                      onChange={(e) => setServerForm({
                        ...serverForm,
                        status: e.target.checked ? 'Online' : 'Offline'
                      })}
                    />
                    <label className="form-check-label ms-3" style={{ color: '#0a0a0a', fontWeight: 600 }}>
                      {serverForm.status === 'Online' ? 'Đang Hoạt Động' : 'Đang Tắt'}
                    </label>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label">Số Người Chơi Hiện Tại</label>
                  <input
                    type="number"
                    className="form-control"
                    name="players"
                    value={serverForm.players}
                    onChange={handleServerChange}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Số Người Chơi Tối Đa</label>
                  <input
                    type="number"
                    className="form-control"
                    name="maxPlayers"
                    value={serverForm.maxPlayers}
                    onChange={handleServerChange}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Phiên Bản</label>
                  <input
                    type="text"
                    className="form-control"
                    name="version"
                    value={serverForm.version}
                    onChange={handleServerChange}
                    placeholder="Ví dụ: 1.20.4 hoặc > 1.21.4"
                  />
                </div>
                <motion.button
                  className="winter-button"
                  onClick={handleServerSave}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BiCheckCircle className="me-2" />
                  Lưu Thay Đổi
                </motion.button>
              </div>
            </motion.div>
          )}

          {activeTab === 'categories' && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ShopCategoriesManagement />
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ShopProductsManagement />
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ShopOrdersManagement />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="winter-section-title mb-4" style={{ wordWrap: 'break-word' }}>Cài Đặt Website</h1>
              <div className="admin-card glass">
                <div className="mb-4">
                  <label className="form-label">Tiêu Đề Website</label>
                  <input
                    type="text"
                    className="form-control"
                    name="site_title"
                    value={settingsForm.site_title}
                    onChange={handleSettingsChange}
                    placeholder="BuildnChill"
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">IP Server</label>
                  <input
                    type="text"
                    className="form-control"
                    name="server_ip"
                    value={settingsForm.server_ip}
                    onChange={handleSettingsChange}
                    placeholder="play.buildnchill.com"
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Phiên Bản Server</label>
                  <input
                    type="text"
                    className="form-control"
                    name="server_version"
                    value={serverStatus?.version || settingsForm.server_version || ''}
                    onChange={handleSettingsChange}
                    placeholder="Tự động lấy từ trạng thái server"
                    readOnly
                    style={{ backgroundColor: 'rgba(0,0,0,0.2)', cursor: 'not-allowed' }}
                  />
                  <small className="form-text" style={{ color: '#9ca3af' }}>
                    Phiên bản được tự động lấy từ phần Trạng Thái Server
                  </small>
                </div>
                <div className="mb-4">
                  <label className="form-label">Email Liên Hệ</label>
                  <input
                    type="email"
                    className="form-control"
                    name="contact_email"
                    value={settingsForm.contact_email}
                    onChange={handleSettingsChange}
                    placeholder="contact@buildnchill.com"
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Số Điện Thoại</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="contact_phone"
                    value={settingsForm.contact_phone}
                    onChange={handleSettingsChange}
                    placeholder="+1 (234) 567-890"
                  />
                </div>
                <motion.button
                  className="winter-button"
                  onClick={handleSettingsSave}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BiCheckCircle className="me-2" />
                  Lưu Cài Đặt
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
      {showModal && (
        <motion.div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="modal-dialog modal-lg"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
          >
            <div className="modal-content glass-strong" style={{ border: '2px solid var(--winter-blue)' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid rgba(14, 165, 233, 0.3)' }}>
                <h5 className="modal-title" style={{ color: 'var(--winter-blue)' }}>
                  {editingPost ? 'Sửa Bài Viết' : 'Thêm Bài Viết Mới'}
                </h5>
                <motion.button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPost(null);
                  }}
                  whileHover={{ rotate: 90 }}
                  style={{ filter: 'invert(1)' }}
                ></motion.button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Tiêu Đề</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Mô Tả</label>
                  <textarea
                    className="form-control"
                    name="description"
                    rows="2"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập mô tả ngắn gọn về bài viết..."
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">Nội Dung</label>
                  <p style={{ color: '#1a1a1a', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 500 }}>
                    Bạn có thể dán HTML, ảnh, video, iframe và bất kỳ nội dung nào. Editor hỗ trợ đầy đủ HTML như Drupal.
                  </p>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                    placeholder="Nhập nội dung bài viết... Bạn có thể dán HTML, ảnh, video, iframe trực tiếp vào đây."
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">URL Hình Ảnh</label>
                  <input
                    type="url"
                    className="form-control"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    required
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Ngày Đăng</label>
                  <input
                    type="date"
                    className="form-control"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid rgba(251, 191, 36, 0.3)' }}>
                <motion.button
                  type="button"
                  className="winter-button-outline"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPost(null);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BiXCircle className="me-2" />
                  Hủy
                </motion.button>
                <motion.button
                  type="button"
                  className="winter-button"
                  onClick={handleSave}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BiCheckCircle className="me-2" />
                  Lưu
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Contact Detail Modal */}
      {showContactModal && selectedContact && (
        <motion.div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="modal-dialog modal-lg"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
          >
            <div className="modal-content glass-strong" style={{ border: '2px solid var(--winter-blue)' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid rgba(14, 165, 233, 0.3)' }}>
                <h5 className="modal-title" style={{ color: 'var(--winter-blue-dark)', fontWeight: 800 }}>
                  Chi Tiết Liên Hệ
                </h5>
                <motion.button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowContactModal(false);
                    setSelectedContact(null);
                  }}
                  whileHover={{ rotate: 90 }}
                  style={{ filter: 'invert(1)' }}
                ></motion.button>
              </div>
              <div className="modal-body" style={{ color: '#0a0a0a' }}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong style={{ color: 'var(--winter-blue-dark)', fontSize: '1rem' }}>Tên Game:</strong>
                    <p style={{ color: '#1a1a1a', fontWeight: 500, marginTop: '0.5rem' }}>{selectedContact.ign}</p>
                  </div>
                  <div className="col-md-6">
                    <strong style={{ color: 'var(--winter-blue)', fontSize: '1rem' }}>Email:</strong>
                    <p style={{ marginTop: '0.5rem' }}><a href={`mailto:${selectedContact.email}`} style={{ color: 'var(--winter-blue)', fontWeight: 500 }}>{selectedContact.email}</a></p>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong style={{ color: 'var(--winter-blue)', fontSize: '1rem' }}>Số Điện Thoại:</strong>
                    <p style={{ color: '#1a1a1a', fontWeight: 500, marginTop: '0.5rem' }}>{selectedContact.phone || '-'}</p>
                  </div>
                  <div className="col-md-6">
                    <strong style={{ color: 'var(--winter-blue)', fontSize: '1rem' }}>Danh Mục:</strong>
                    <p style={{ marginTop: '0.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        backgroundColor: 'rgba(14, 165, 233, 0.2)',
                        color: 'var(--winter-blue)',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}>
                        {categoryLabels[selectedContact.category] || 'Khác'}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mb-3">
                  <strong style={{ color: 'var(--winter-blue)', fontSize: '1rem' }}>Nội Dung:</strong>
                  <p style={{ whiteSpace: 'pre-wrap', color: '#1a1a1a', fontWeight: 500, marginTop: '0.5rem' }}>{selectedContact.message}</p>
                </div>
                {selectedContact.image_url && (
                  <div className="mb-3">
                    <strong style={{ color: 'var(--winter-blue)', fontSize: '1rem' }}>Ảnh Đính Kèm:</strong>
                    <div className="mt-2" style={{ textAlign: 'center' }}>
                      <img 
                        src={selectedContact.image_url} 
                        alt="Contact attachment" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '500px',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          border: '2px solid var(--winter-blue)',
                          backgroundColor: '#f9fafb',
                          display: 'block',
                          margin: '0 auto'
                        }}
                        onError={(e) => {
                          console.error('Error loading image:', selectedContact.image_url);
                          e.target.alt = 'Không thể tải ảnh';
                          e.target.style.border = '2px dashed #dc2626';
                          e.target.style.padding = '2rem';
                        }}
                      />
                      <a 
                        href={selectedContact.image_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          display: 'inline-block',
                          marginTop: '0.5rem',
                          color: 'var(--winter-blue)',
                          textDecoration: 'underline',
                          fontSize: '0.875rem'
                        }}
                      >
                        Mở ảnh trong tab mới
                      </a>
                    </div>
                  </div>
                )}
                <div className="mb-3">
                  <strong style={{ color: 'var(--winter-blue)', fontSize: '1rem' }}>Ngày Gửi:</strong>
                  <p style={{ color: '#1a1a1a', fontWeight: 500, marginTop: '0.5rem' }}>{new Date(selectedContact.created_at).toLocaleString('vi-VN')}</p>
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid rgba(14, 165, 233, 0.3)' }}>
                <motion.button
                  type="button"
                  className="winter-button-outline"
                  onClick={() => {
                    setShowContactModal(false);
                    setSelectedContact(null);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BiXCircle className="me-2" />
                  Đóng
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Admin;
