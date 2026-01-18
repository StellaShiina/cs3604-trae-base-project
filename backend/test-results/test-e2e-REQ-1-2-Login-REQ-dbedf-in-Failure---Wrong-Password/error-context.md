# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - button "扫码登录" [ref=e6]
      - button "账号登录" [ref=e7]
    - generic [ref=e8]:
      - textbox "用户名/邮箱/手机号" [ref=e9]: login_test_user
      - textbox "密码" [ref=e10]: WrongPass
      - button "立即登录" [ref=e11]
      - generic [ref=e12]:
        - link "注册12306账号" [ref=e13] [cursor=pointer]:
          - /url: /register
        - link "忘记密码" [ref=e14] [cursor=pointer]:
          - /url: /forgot-password
  - generic [ref=e16]:
    - heading "安全验证" [level=3] [ref=e17]
    - textbox "证件号后4位" [ref=e18]: "8888"
    - button "获取验证码" [ref=e19]
    - textbox "验证码" [ref=e20]: "123456"
    - button "确定" [active] [ref=e21]
```