// تنبيه بسيط عند إرسال نموذج التواصل
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      alert('تم إرسال رسالتك بنجاح! شكرًا لتواصلك مع الحضري نت 🌟');
      form.reset();
    });
  }
});
