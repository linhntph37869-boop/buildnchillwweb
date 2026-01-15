import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { BiArrowBack, BiCalendar } from 'react-icons/bi';
import SnowEffect from '../components/SnowEffect';
import 'react-quill/dist/quill.snow.css';
import '../styles/winter-theme.css';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { news } = useData();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const foundPost = news.find(p => p.id === parseInt(id));
    if (foundPost) {
      setPost(foundPost);
      document.title = `${foundPost.title} - BuildnChill News`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', foundPost.description || 'Đọc tin tức mới nhất từ BuildnChill Minecraft.');
      }
    } else {
      navigate('/news');
    }
  }, [id, navigate, news]);

  if (!post) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="spinner-neon mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="winter-container">
      <SnowEffect />
      <div className="container my-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/news" className="winter-button-outline mb-4 d-inline-flex align-items-center">
            <BiArrowBack className="me-2" />
            Quay Lại Tin Tức
          </Link>
        </motion.div>
        
        <article className="glass p-4">
          <motion.img 
            src={post.image} 
            className="img-fluid rounded mb-4" 
            alt={post.title}
            style={{ 
              width: '100%', 
              height: 'auto',
              border: '2px solid rgba(14, 165, 233, 0.3)',
              borderRadius: '12px'
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          />
          <motion.h1
            className="winter-title"
            style={{ 
              marginBottom: '1rem'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {post.title}
          </motion.h1>
          <motion.p 
            className="mb-4"
            style={{ color: 'var(--text-secondary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <BiCalendar className="me-2" style={{ color: 'var(--winter-blue)' }} />
            {new Date(post.date).toLocaleDateString('vi-VN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </motion.p>
          <motion.div
            className="news-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="ql-editor" dangerouslySetInnerHTML={{ __html: post.content }} style={{ padding: 0 }} />
          </motion.div>
        </article>
      </motion.div>
      </div>
    </div>
  );
};

export default NewsDetail;
