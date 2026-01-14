import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaDiscord } from 'react-icons/fa';
import { useData } from '../context/DataContext';

const Footer = () => {
  const { siteSettings, serverStatus } = useData();
  
  const socialLinks = [
    { icon: FaDiscord, href: siteSettings?.discord_url || 'https://discord.gg/Kum6Wvz23P', label: 'Discord' }
  ];

  return (
    <motion.footer 
      className="footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6 mb-4">
            <h5>{siteSettings?.site_title || 'BuildnChill'}</h5>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
              Server Minecraft cộng đồng thân thiện của chúng tôi. Xây dựng, khám phá và thư giãn cùng chúng tôi! 
              Tham gia cộng đồng sôi động và trải nghiệm gameplay Minecraft tuyệt vời nhất.
            </p>
            <div className="social-icons">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{ 
                      background: 'linear-gradient(135deg, #5865F2 0%, #7289DA 100%)',
                      color: 'white', 
                      padding: '8px', 
                      borderRadius: '50%', 
                      display: 'inline-flex',
                      border: '3px solid var(--winter-blue)',
                      boxShadow: '0 0 20px rgba(88, 101, 242, 0.6), 0 0 10px rgba(14, 165, 233, 0.4)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Icon size={24} />
                  </motion.a>
                );
              })}
            </div>
          </div>
          <div className="col-lg-2 col-md-6 mb-4">
            <h5>Liên Kết Nhanh</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/">Trang Chủ</Link>
              </li>
              <li className="mb-2">
                <Link to="/about">Giới Thiệu</Link>
              </li>
              <li className="mb-2">
                <Link to="/news">Tin Tức</Link>
              </li>
              <li className="mb-2">
                <Link to="/shop">Cửa Hàng</Link>
              </li>
              <li className="mb-2">
                <Link to="/contact">Liên Hệ</Link>
              </li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6 mb-4">
            <h5 style={{ color: 'var(--winter-blue)', textShadow: '0 0 10px rgba(14, 165, 233, 0.4)' }}>Thông Tin Server</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <strong style={{ color: 'var(--winter-blue)', fontSize: '1rem' }}>IP:</strong>
                <span style={{ 
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  color: 'var(--winter-blue-dark)',
                  textShadow: '0 0 5px rgba(14, 165, 233, 0.2)',
                  marginLeft: '0.5rem'
                }}>{siteSettings?.server_ip || 'play.buildnchill.com'}</span>
              </li>
              <li className="mb-2">
                <strong style={{ color: 'var(--winter-blue)' }}>Phiên Bản:</strong>
                <span style={{ marginLeft: '0.5rem', fontWeight: '700', color: 'var(--winter-blue-dark)' }}>
                  {serverStatus?.version || siteSettings?.server_version || '1.20.4'}
                </span>
              </li>
              <li className="mb-2">
                <strong style={{ color: 'var(--winter-blue)' }}>Trạng Thái:</strong>
                <span style={{ marginLeft: '0.5rem', fontWeight: '700', color: serverStatus?.status === 'Online' ? '#10b981' : '#ef4444' }}>
                  {serverStatus?.status === 'Online' ? '🟢 Đang Hoạt Động' : '🔴 Bảo Trì'}
                </span>
              </li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6 mb-4">
            <h5 style={{ color: 'var(--winter-blue)', textShadow: '0 0 10px rgba(14, 165, 233, 0.4)' }}>Liên Hệ</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <strong style={{ color: 'var(--winter-blue)' }}>Email:</strong><br />
                <a href={`mailto:${siteSettings?.contact_email || 'contact@buildnchill.com'}`} style={{ 
                  color: 'var(--winter-blue-dark)',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  textShadow: '0 0 5px rgba(14, 165, 233, 0.2)'
                }}>
                  {siteSettings?.contact_email || 'contact@buildnchill.com'}
                </a>
              </li>
              <li className="mb-2">
                <strong style={{ color: 'var(--winter-blue)' }}>Số Điện Thoại:</strong><br />
                <a href={`tel:${siteSettings?.contact_phone?.replace(/\s/g, '') || '+1234567890'}`} style={{ 
                  color: 'var(--winter-blue-dark)',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  textShadow: '0 0 5px rgba(14, 165, 233, 0.2)'
                }}>
                  {siteSettings?.contact_phone || '+1 (234) 567-890'}
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <hr style={{ borderColor: 'var(--winter-blue)', margin: '2rem 0', borderWidth: '1px', opacity: 0.2 }} />
        
        <div className="text-center">
          <p className="mb-2" style={{ 
            color: 'var(--winter-blue-dark)', 
            fontSize: '1.1rem', 
            fontWeight: '700',
            textShadow: '0 0 10px rgba(14, 165, 233, 0.2)',
            letterSpacing: '1px'
          }}>
            &copy; {new Date().getFullYear()} {siteSettings?.site_title || 'BuildnChill'}. All rights reserved. 
            <span style={{ color: 'var(--winter-blue)', marginLeft: '0.5rem', textShadow: '0 0 15px rgba(14, 165, 233, 0.4)' }}>❄️ Chúc bạn một mùa đông ấm áp! ❄️</span>
          </p>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: '0.95rem', color: 'var(--winter-blue-dark)', fontWeight: '600' }}
          >
            Website được thiết kế và quản lý bởi <span style={{ color: 'var(--winter-blue)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', textShadow: '0 0 10px rgba(14, 165, 233, 0.3)' }}>T-Dev29</span>
          </motion.div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;