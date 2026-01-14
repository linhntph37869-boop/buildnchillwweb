import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BiUser, BiEnvelope, BiPhone, BiMessageSquare, BiSend, BiImageAdd, BiX } from 'react-icons/bi';
import { useData } from '../context/DataContext';
import SnowEffect from '../components/SnowEffect';
import '../styles/winter-theme.css';

const Contact = () => {
  const { submitContact } = useData();

  useEffect(() => {
    document.title = 'Liên Hệ - BuildnChill Minecraft';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Liên hệ với đội ngũ quản trị BuildnChill để được hỗ trợ, báo lỗi hoặc góp ý về máy chủ.');
    }
  }, []);
  const [formData, setFormData] = useState({
    ign: '',
    email: '',
    phone: '',
    category: '',
    message: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { value: 'report', label: 'Báo Cáo (Report)' },
    { value: 'help', label: 'Trợ Giúp (Help)' },
    { value: 'bug', label: 'Báo Lỗi (Bug)' },
    { value: 'suggestion', label: 'Đề Xuất (Suggestion)' },
    { value: 'other', label: 'Khác (Other)' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB!');
        return;
      }
      setFormData({
        ...formData,
        image: file
      });
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      image: null
    });
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setUploading(true);
    
    try {
      const success = await submitContact(formData);
      if (success) {
        alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể. 🎊');
        setFormData({
          ign: '',
          email: '',
          phone: '',
          category: '',
          message: '',
          image: null
        });
        setImagePreview(null);
        // Reset file input
        const fileInput = document.getElementById('image');
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      console.error('Error submitting contact:', error);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const formFields = [
    { name: 'ign', label: 'Tên Trong Game (IGN)', icon: BiUser, type: 'text', required: true },
    { name: 'email', label: 'Email', icon: BiEnvelope, type: 'email', required: true },
    { name: 'phone', label: 'Số Điện Thoại', icon: BiPhone, type: 'tel', required: false }
  ];

  return (
    <div className="winter-container">
      <SnowEffect />
      <div className="container my-5">
      <motion.div 
        className="row"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="col-lg-8 mx-auto">
          <motion.h1 
            className="winter-title mb-4 text-center"
          >
            Liên Hệ Chúng Tôi
          </motion.h1>
          <motion.p 
            className="mb-5 text-center"
            style={{ color: 'var(--winter-text)', fontSize: '1.1rem' }}
          >
            Have a question or need help? Fill out the form below and we'll get back to you as soon as possible.
          </motion.p>

          <motion.form 
            onSubmit={handleSubmit}
            className="glass p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {formFields.map((field, index) => {
              const Icon = field.icon;
              return (
                <motion.div 
                  key={field.name}
                  className="mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <label htmlFor={field.name} className="form-label">
                    <Icon className="me-2" style={{ color: 'var(--winter-blue)' }} />
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    className="form-control"
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.label}
                    required={field.required}
                  />
                </motion.div>
              );
            })}

            <motion.div 
              className="mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label htmlFor="category" className="form-label">
                <BiMessageSquare className="me-2" style={{ color: 'var(--winter-blue)' }} />
                Danh Mục
              </label>
              <select
                className="form-control"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </motion.div>

            <motion.div 
              className="mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label htmlFor="message" className="form-label" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                <BiMessageSquare className="me-2" style={{ color: 'var(--winter-blue)' }} />
                Tin Nhắn
              </label>
              <textarea
                className="form-control"
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Nhập tin nhắn của bạn..."
                rows="5"
                required
                style={{ minHeight: '150px', resize: 'vertical' }}
              ></textarea>
            </motion.div>

            <motion.div 
              className="mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <label htmlFor="image" className="form-label">
                <BiImageAdd className="me-2" style={{ color: 'var(--winter-blue)' }} />
                Tải Ảnh Lên (Tùy chọn)
              </label>
              <input
                type="file"
                className="form-control"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
              />
              <small className="form-text" style={{ color: '#9ca3af' }}>
                Chỉ chấp nhận file ảnh, kích thước tối đa 5MB
              </small>
              {imagePreview && (
                <div className="mt-3 position-relative" style={{ maxWidth: '300px' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: '100%',
                      borderRadius: '8px',
                      border: '2px solid var(--winter-blue)'
                    }}
                  />
                  <motion.button
                    type="button"
                    onClick={handleRemoveImage}
                    className="position-absolute"
                    style={{
                      top: '5px',
                      right: '5px',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#ef4444',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <BiX />
                  </motion.button>
                </div>
              )}
            </motion.div>

            <motion.button 
              type="submit" 
              className="winter-button w-100"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={submitting || uploading}
              style={{ opacity: (submitting || uploading) ? 0.7 : 1 }}
            >
              <BiSend className="me-2" />
              {(submitting || uploading) ? 'Đang Gửi...' : 'Gửi Tin Nhắn'}
            </motion.button>
          </motion.form>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default Contact;
