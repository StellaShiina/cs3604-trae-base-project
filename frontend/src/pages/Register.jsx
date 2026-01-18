import React, { useState } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    idType: '1',
    idNumber: '',
    phone: '',
    smsCode: '',
    agreed: false
  });

  return (
    <div className="register-page">
      <h2>账号注册</h2>
      <form>
        {/* Username */}
        <div className="form-group">
          <label>用户名</label>
          <input 
            type="text" 
            placeholder="用户名设置成功后不可修改" 
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />
          {/* Errors/Hints will go here */}
        </div>

        {/* Password */}
        <div className="form-group">
          <label>登录密码</label>
          <input 
            type="password" 
            placeholder="6-20位字母、数字或符号" 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label>确认密码</label>
          <input 
            type="password" 
            placeholder="再次输入您的登录密码" 
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          />
        </div>

        {/* Name */}
        <div className="form-group">
          <label>姓名</label>
          <input 
            type="text" 
            placeholder="请输入姓名" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        {/* ID Type */}
        <div className="form-group">
          <label>证件类型</label>
          <select 
            value={formData.idType}
            onChange={(e) => setFormData({...formData, idType: e.target.value})}
          >
            <option value="1">居民身份证</option>
            <option value="2">港澳台居民居住证</option>
            <option value="C">港澳居民来往内地通行证</option>
            <option value="G">台湾居民来往大陆通行证</option>
            <option value="B">护照</option>
          </select>
        </div>

        {/* ID Number */}
        <div className="form-group">
          <label>证件号码</label>
          <input 
            type="text" 
            placeholder="请输入您的证件号码" 
            value={formData.idNumber}
            onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
          />
        </div>

        {/* Phone */}
        <div className="form-group">
          <label>手机号码</label>
          <select defaultValue="+86">
            <option value="+86">+86 中国</option>
          </select>
          <input 
            type="text" 
            placeholder="手机号码" 
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>

        {/* SMS Code */}
        <div className="form-group">
          <label>验证码</label>
          <input 
            type="text" 
            placeholder="输入验证码" 
            value={formData.smsCode}
            onChange={(e) => setFormData({...formData, smsCode: e.target.value})}
          />
          <button type="button">获取验证码</button>
        </div>

        {/* Agreement */}
        <div className="form-group">
          <label>
            <input 
              type="checkbox" 
              checked={formData.agreed}
              onChange={(e) => setFormData({...formData, agreed: e.target.checked})}
            />
            我已阅读并同意《服务条款》
          </label>
        </div>

        <button type="button">下一步</button>
      </form>
    </div>
  );
};

export default Register;
