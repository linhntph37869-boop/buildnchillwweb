import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BiServer, BiUser, BiCalendar, BiTime, BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import SnowEffect from '../components/SnowEffect';
import '../styles/carousel.css';
import '../styles/winter-theme.css';

const Home = () => {
  const { news, serverStatus, siteSettings } = useData();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const latestNews = news.slice(0, 3);

  const carouselImages = [
    'https://foodtek.vn/sites/default/files/2026-01/PC.webp',
    'https://foodtek.vn/sites/default/files/2025-12/462570011_607189315167864_5786208777291669050_n.webp',
    'https://foodtek.vn/sites/default/files/2025-12/467459402_525799813831572_2048064753693338637_n.webp',
    'https://foodtek.vn/sites/default/files/2025-12/467457844_1958845277932349_4464426894527163495_n.webp',
    'https://foodtek.vn/sites/default/files/2025-12/2025-02-17_21.42.55.webp',
    'https://foodtek.vn/sites/default/files/2025-12/6-3_01.webp',
    'https://foodtek.vn/sites/default/files/2025-12/2025-09-20_20.49.28.webp',
    'https://foodtek.vn/sites/default/files/2025-12/2025-12-19_23.28.20.webp',
    'https://foodtek.vn/sites/default/files/2025-12/2025-12-19_23.25.58.webp',
    'https://foodtek.vn/sites/default/files/2025-12/17-915.webp'
  ];

  useEffect(() => {
    document.title = 'BuildnChill - Máy Chủ Minecraft Cộng Đồng Việt Nam';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'BuildnChill - Máy chủ Minecraft cộng đồng Việt Nam. Tham gia ngay để trải nghiệm môi trường xây dựng và giải trí tuyệt vời.');
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  const features = [
    { icon: BiServer, title: 'Hoạt Động 24/7', description: 'Luôn online, luôn sẵn sàng' },
    { icon: BiUser, title: 'Cộng Đồng Năng Động', description: 'Tham gia cùng hàng nghìn người chơi' },
    { icon: BiTime, title: 'Sự Kiện Thường Xuyên', description: 'Cuộc thi hàng tuần và nhiều niềm vui' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="winter-container">
      <SnowEffect />
      <section className="hero-carousel">
        <div className="carousel-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              className="carousel-slide"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src={carouselImages[currentSlide]} 
                alt={`Slide ${currentSlide + 1}`}
                className="carousel-image"
              />
            </motion.div>
          </AnimatePresence>
        </div>
        
        <button 
          className="carousel-btn carousel-btn-prev"
          onClick={() => setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)}
        >
          <BiChevronLeft size={30} />
        </button>
        
        <button 
          className="carousel-btn carousel-btn-next"
          onClick={() => setCurrentSlide((prev) => (prev + 1) % carouselImages.length)}
        >
          <BiChevronRight size={30} />
        </button>
      </section>

      <div className="container my-5">
        <motion.section 
          className="mb-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2 
            className="winter-section-title text-center mb-5"
            variants={itemVariants}
          >
            Tại Sao Chọn Chúng Tôi?
          </motion.h2>
          <div className="row g-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={index}
                  className="col-md-4"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  <div className="card glass text-center p-4 h-100">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon size={60} style={{ color: 'var(--winter-blue)', marginBottom: '1rem' }} />
                    </motion.div>
                    <h4 style={{ color: 'var(--winter-blue-dark)', marginBottom: '1rem', fontWeight: 700 }}>{feature.title}</h4>
                    <p style={{ color: 'var(--winter-text)' }}>{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <motion.section 
          className="mb-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2 
            className="winter-section-title mb-4"
            variants={itemVariants}
          >
            Tin Tức Mới Nhất
          </motion.h2>
          <div className="row g-4">
            {latestNews.map((post, index) => (
              <motion.div 
                key={post.id}
                className="col-md-4"
                variants={itemVariants}
                whileHover={{ y: -10 }}
              >
                <div className="card glass h-100">
                  <motion.img 
                    src={post.image} 
                    className="card-img-top" 
                    alt={post.title}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title news-title-truncate" style={{ color: '#1a1a1a', fontWeight: 700 }}>{post.title}</h5>
                    <p className="text-muted small mb-2">
                      <BiCalendar className="me-1" />
                      {new Date(post.date).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="card-text news-description-truncate" style={{ color: '#4a4a4a', flex: 1 }}>
                      {post.description}
                    </p>
                    <div className="mt-auto">
                      <Link to={`/news/${post.id}`} className="winter-button w-100 text-center">
                        Đọc Thêm
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div 
            className="text-center mt-4"
            variants={itemVariants}
          >
            <Link to="/news" className="winter-button-outline">
              Xem Tất Cả Tin Tức
            </Link>
          </motion.div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="winter-section-title mb-4">
            Trạng Thái Server
          </h2>
          {serverStatus && (
            <div className="server-status-card glass">
              <div className="row">
                <div className="col-md-4 col-sm-6 server-status-item">
                  <strong style={{ color: '#1a1a1a' }}>Trạng Thái</strong>
                  <div>
                    <motion.span 
                      className={`badge ${serverStatus.status === 'Online' ? 'bg-success' : 'bg-danger'}`}
                      style={{ 
                        fontSize: '1rem', 
                        padding: '0.5rem 1rem',
                        background: serverStatus.status === 'Online' ? 'var(--winter-blue)' : 'var(--winter-gray)',
                        color: '#ffffff',
                        fontWeight: 700
                      }}
                    >
                      {serverStatus.status === 'Online' ? 'Đang Hoạt Động' : 'Đang Tắt'}
                    </motion.span>
                  </div>
                </div>
                <div className="col-md-4 col-sm-6 server-status-item">
                  <strong style={{ color: '#1a1a1a' }}>Người Chơi</strong>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>
                    {serverStatus.players} / {serverStatus.maxPlayers}
                  </div>
                </div>
                <div className="col-md-4 col-sm-6 server-status-item">
                  <strong style={{ color: '#1a1a1a' }}>Phiên Bản</strong>
                  <div style={{ fontSize: '1.2rem', color: '#1a1a1a', fontWeight: 600 }}>{serverStatus?.version || siteSettings?.server_version || '1.20.4'}</div>
                </div>
              </div>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default Home;
