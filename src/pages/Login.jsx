import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { BiShield, BiUser, BiLock } from 'react-icons/bi';
import '../styles/winter-theme.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useData();

  useEffect(() => {
    document.title = 'Đăng Nhập Quản Trị - BuildnChill';
  }, []);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/admin');
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
    }
  };

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-md-6 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="card glass p-4">
              <div className="text-center mb-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <BiShield size={60} style={{ color: 'var(--winter-blue)' }} />
                </motion.div>
                <h2 className="mt-3 winter-title">
                  Đăng Nhập Quản Trị
                </h2>
              </div>
              {error && (
                <motion.div
                  className="alert alert-danger"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ 
                    background: 'rgba(255, 68, 68, 0.2)',
                    border: '1px solid #ff4444',
                    color: '#ff4444',
                    fontWeight: 600
                  }}
                >
                  {error}
                </motion.div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Tên Đăng Nhập</label>
                  <div className="position-relative">
                    <BiUser 
                      size={20} 
                      style={{ 
                        position: 'absolute', 
                        left: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        color: 'var(--winter-blue)'
                      }} 
                    />
                    <input
                      type="text"
                      className="form-control"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      style={{ paddingLeft: '3rem' }}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Mật Khẩu</label>
                  <div className="position-relative">
                    <BiLock 
                      size={20} 
                      style={{ 
                        position: 'absolute', 
                        left: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        color: 'var(--winter-blue)'
                      }} 
                    />
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ paddingLeft: '3rem' }}
                    />
                  </div>
                </div>
                <motion.button
                  type="submit"
                  className="winter-button w-100"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Đăng Nhập
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
