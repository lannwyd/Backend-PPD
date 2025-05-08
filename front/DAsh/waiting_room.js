// document.addEventListener('DOMContentLoaded', function() {
//     // عناصر واجهة المستخدم الرئيسية
//     const createSessionBtn = document.getElementById('create_session_btn');
//     const joinSessionBtn = document.getElementById('Join_session_btn');
//     const sidebarIcons = document.querySelectorAll('.icon_txt');
//     const sessionNameInput = document.getElementById('Session_Name');
//     const descriptionInput = document.getElementById('Description');
//     const sessionIdInput = document.getElementById('Session_ID');

//     // رسائل الخطأ
//     const sessionNameError = document.getElementById('SessionName_error_message');
//     const descriptionError = document.getElementById('Description_error_message');
//     const sessionIdError = document.getElementById('SessionID_error_message');

//     // تهيئة الصفحة
//     initPage();

//     // أحداث الأزرار والنماذج
//     setupEventListeners();

//     // وظائف إضافية
//     loadRecentSessions();

//     // ========== الوظائف الرئيسية ========== //

//     function initPage() {
//         // إضافة تأثيرات للواجهة
//         document.querySelectorAll('input, select').forEach(el => {
//             el.addEventListener('focus', function() {
//                 this.style.border = '1px solid #9FEF00';
//                 this.style.boxShadow = '0 0 0 2px rgba(159, 239, 0, 0.2)';
//             });

//             el.addEventListener('blur', function() {
//                 this.style.border = '1px solid #374151';
//                 this.style.boxShadow = 'none';
//             });
//         });

//         // تمييز العنصر النشط في القائمة الجانبية
//         highlightActiveMenuItem();
//     }

//     function setupEventListeners() {
//         // زر إنشاء جلسة جديدة
//         createSessionBtn.addEventListener('click', function(e) {
//             e.preventDefault();

//             // التحقق من صحة المدخلات
//             const isSessionNameValid = validateSessionName();
//             const isDescriptionValid = validateDescription();

//             if (isSessionNameValid && isDescriptionValid) {
//                 createNewSession();
//             }
//         });

//         // زر الانضمام إلى جلسة
//         joinSessionBtn.addEventListener('click', function(e) {
//             e.preventDefault();

//             if (validateSessionId()) {
//                 joinExistingSession();
//             }
//         });

//         // أحداث القائمة الجانبية
//         sidebarIcons.forEach(icon => {
//             icon.addEventListener('click', function() {
//                 // إزالة التحديد من جميع العناصر
//                 sidebarIcons.forEach(i => {
//                     i.querySelector('p').style.color = '#FFFFFF';
//                 });

//                 // تحديد العنصر الحالي
//                 this.querySelector('p').style.color = '#9FEF00';

//                 // تحميل المحتوى المناسب (يمكن تنفيذه لاحقاً)
//                 loadContent(this.querySelector('p').textContent);
//             });
//         });
//     }

//     // ========== وظائف التحقق من الصحة ========== //

//     function validateSessionName() {
//         if (!sessionNameInput.value.trim()) {
//             sessionNameError.textContent = 'Session name is required';
//             sessionNameError.style.color = '#EF4444';
//             sessionNameInput.style.borderColor = '#EF4444';
//             return false;
//         }

//         if (sessionNameInput.value.trim().length < 3) {
//             sessionNameError.textContent = 'Session name must be at least 3 characters';
//             sessionNameError.style.color = '#EF4444';
//             sessionNameInput.style.borderColor = '#EF4444';
//             return false;
//         }

//         sessionNameError.textContent = '';
//         sessionNameInput.style.borderColor = '#374151';
//         return true;
//     }

//     function validateDescription() {
//         if (!descriptionInput.value.trim()) {
//             descriptionError.textContent = 'Description is required';
//             descriptionError.style.color = '#EF4444';
//             descriptionInput.style.borderColor = '#EF4444';
//             return false;
//         }

//         descriptionError.textContent = '';
//         descriptionInput.style.borderColor = '#374151';
//         return true;
//     }

//     function validateSessionId() {
//         if (!sessionIdInput.value.trim()) {
//             sessionIdError.textContent = 'Session ID is required';
//             sessionIdError.style.color = '#EF4444';
//             sessionIdInput.style.borderColor = '#EF4444';
//             return false;
//         }

//         // يمكن إضافة تحقق إضافي هنا (مثل تنسيق معين لـ ID)

//         sessionIdError.textContent = '';
//         sessionIdInput.style.borderColor = '#374151';
//         return true;
//     }

//     // ========== وظائف العمل ========== //

//     function createNewSession() {
//         // عرض حالة التحميل
//         createSessionBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Session...';
//         createSessionBtn.disabled = true;

//         // محاكاة اتصال بالخادم (استبدل هذا بالاتصال الفعلي)
//         setTimeout(() => {
//             // بيانات الجلسة الجديدة
//             const sessionData = {
//                 name: sessionNameInput.value.trim(),
//                 description: descriptionInput.value.trim(),
//                 lab: document.getElementById('Select_Lab').value,
//                 createdAt: new Date().toISOString()
//             };

//             // حفظ الجلسة في localStorage (مؤقتاً)
//             saveSessionToLocalStorage(sessionData);

//             // إعادة تعيين النموذج
//             resetCreateSessionForm();

//             // تحميل الجلسات الأخيرة مع الجلسة الجديدة
//             loadRecentSessions();

//             // عرض رسالة نجاح
//             alert('Session created successfully!');

//             // توجيه المستخدم إلى صفحة الجلسة (يمكن تغيير هذا)
//             // window.location.href = 'session.html?id=' + sessionData.id;
//         }, 1500);
//     }

//     function joinExistingSession() {
//         // عرض حالة التحميل
//         joinSessionBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Joining Session...';
//         joinSessionBtn.disabled = true;

//         // محاكاة اتصال بالخادم (استبدل هذا بالاتصال الفعلي)
//         setTimeout(() => {
//             // إعادة تعيين النموذج
//             sessionIdInput.value = '';

//             // عرض رسالة نجاح
//             alert('Joined session successfully!');

//             // توجيه المستخدم إلى صفحة الجلسة (يمكن تغيير هذا)
//             // window.location.href = 'session.html?id=' + sessionIdInput.value.trim();
//         }, 1500);
//     }

//     // ========== وظائف مساعدة ========== //

//     function highlightActiveMenuItem() {
//         // يمكن تعديل هذا بناءً على الصفحة الحالية
//         const dashboardItem = document.querySelector('.icon_txt p[style="color: #9FEF00;"]');
//         if (dashboardItem) {
//             dashboardItem.parentElement.style.backgroundColor = 'rgba(159, 239, 0, 0.1)';
//         }
//     }

//     function loadContent(contentName) {
//         // يمكن تنفيذ هذا لتحميل محتوى مختلف بناءً على العنصر المحدد
//         console.log('Loading content for:', contentName);
//         // يمكنك إضافة AJAX هنا لتحميل المحتوى ديناميكياً
//     }

//     function loadRecentSessions() {
//         // هذه الوظيفة تستخدم البيانات المخزنة محلياً، يمكن استبدالها بطلب AJAX
//         const sessions = JSON.parse(localStorage.getItem('recentSessions')) || [];

//         if (sessions.length > 0) {
//             // يمكن إضافة كود لعرض الجلسات في الواجهة
//             console.log('Loaded recent sessions:', sessions);
//         }
//     }

//     function saveSessionToLocalStorage(sessionData) {
//         const sessions = JSON.parse(localStorage.getItem('recentSessions')) || [];

//         // إضافة معرف فريد للجلسة
//         sessionData.id = 'session-' + Date.now();
//         sessionData.status = 'Successful'; // أو أي حالة افتراضية
//         sessionData.type = 'private'; // أو 'public'

//         // إضافة الجلسة الجديدة إلى المصفوفة
//         sessions.unshift(sessionData);

//         // الحفاظ على عدد معين من الجلسات (مثلاً 10)
//         if (sessions.length > 10) {
//             sessions.pop();
//         }

//         // حفظ في localStorage
//         localStorage.setItem('recentSessions', JSON.stringify(sessions));
//     }

//     function resetCreateSessionForm() {
//         sessionNameInput.value = '';
//         descriptionInput.value = '';
//         document.getElementById('Select_Lab').value = 'Arduino Basic Lab';

//         // إعادة تعيين زر الإنشاء
//         createSessionBtn.innerHTML = '<img src="Documents/plus.svg" alt="plus">Create New Session';
//         createSessionBtn.disabled = false;
//     }

//     // ========== وظائف إضافية ========== //

//     // تحديث الوقت المنقضي منذ إنشاء الجلسات
//     function updateSessionTimes() {
//         document.querySelectorAll('.session_time #time').forEach(el => {
//             const timeText = el.textContent.trim();
//             if (timeText.endsWith('h')) {
//                 const hours = parseInt(timeText);
//                 el.textContent = hours + 1 + 'h ';
//             } else if (timeText.endsWith('d')) {
//                 const days = parseInt(timeText);
//                 el.textContent = days + 1 + 'd ';
//             }
//         });
//     }

//     // تحديث الأوقات كل ساعة
//     setInterval(updateSessionTimes, 3600000);

//     // يمكن إضافة المزيد من الوظائف حسب الحاجة
// });

const Session_Name = document.getElementById("Session_Name");
const Description = document.getElementById("Description");
const Session_ID = document.getElementById("Session_ID");
const create_session_btn = document.getElementById("create_session_btn");
const Join_session_btn = document.getElementById("Join_session_btn");
const SessionName_error_message = document.getElementById("SessionName_error_message");
const Description_error_message = document.getElementById("Description_error_message");
const SessionID_error_message = document.getElementById("SessionID_error_message");


create_session_btn.onclick = function () {

    if (Session_Name.value === "") {
        SessionName_error_message.textContent = "Session name is required";
    } else {
        SessionName_error_message.textContent = "";
    }

    if (Description.value === "") {
        Description_error_message.textContent = "Description is required";
    } else {
        Description_error_message.textContent = "";
        if(Session_Name.value !== ""){
            window.location.href = "../TP/TP_2.html";
        }
    }
}

Join_session_btn.onclick = function () {

    if (Session_ID.value === "") {
        SessionID_error_message.textContent = "Session ID is required";
    } else {
        SessionID_error_message.textContent = "";
        window.location.href = "../TP/TP_2.html";
    }

}


const sid_icon = document.getElementById("sid_icon");
const Aside = document.getElementById("Aside");
const Main = document.getElementById("Main");
let isSidebarVisible = true; 

sid_icon.onclick = function() {
    if (isSidebarVisible) {
        Aside.style.width = "0";
        Aside.style.padding = "0";
        Aside.style.overflow = "hidden";
        Main.style.marginLeft = "-323px"
        
    } else {
        Aside.style.width = "323px";
        Aside.style.padding = "0 10%";
        Aside.style.overflow = "visible";
        Main.style.marginLeft = "0px";
    }
    
    isSidebarVisible = !isSidebarVisible; 
};


const results = document.querySelectorAll('[id^="res"]'); 

results.forEach(res => {
    if(res.textContent.trim() === 'Failed') {
        res.style.backgroundColor = '#FEE2E2';
        res.style.color = '#991B1B';
        res.style.borderRadius = '4px';
        res.style.width = '79px';
        res.style.height = '20px';
    } else if(res.textContent.trim() === 'Successful') {
        res.style.backgroundColor = '#D1FAE5';
        res.style.color = '#065F46';
        res.style.borderRadius = '4px';
    }
});
