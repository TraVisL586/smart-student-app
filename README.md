## v3.2 patch
- Fixed Learning Race: each stage now displays its actual question before the two answer gates. Gates and answer buttons are clickable; swipe remains supported.

# Smart Student v2.2

Prototype PWA cho Bùi Thu Ngân – tân sinh viên UEH K52.

## Chạy
Node.js 18+

```bash
npm start
```
Mở http://localhost:3000

## AI thật
Đặt biến môi trường `OPENAI_API_KEY` trên máy chủ rồi chạy lại `npm start`. Key không nằm trong HTML.

## Tính năng v2
- 12 khu vực, màu chủ đạo xanh lá, mascot rùa.
- Hồ sơ Bùi Thu Ngân / K52.
- AI chat + lịch sử + quiz 10 câu + kế hoạch + kiểm tra tiểu luận + ước tính AI + phân tích năng lực.
- TKB theo ảnh UEH đã cung cấp; tên giáo viên trong TKB và Giảng viên uy tín là tên ảo, không dùng lại tên trong TKB nguồn.
- Video bài giảng: chọn môn → chọn người đăng/kênh YouTube; tên hiển thị khớp nguồn YouTube đã kiểm tra; nút mở video đưa thẳng tới YouTube.
- Tự kiểm tra và đề mô phỏng theo 5 môn.
- 8 game, 5 level, xu/XP bắt đầu từ 0, lịch sử game; quà đổi thưởng có ảnh merchandise mô phỏng UEH mới.
- Nhóm K52 có chat demo và phản hồi.
- Sự kiện 4 nhóm + 13 sự kiện.
- Giảng viên: đánh giá, lưu ý, tiêu chí.
- To-do theo môn + deadline + ưu tiên.
- Analytics 2–4 giờ/ngày, tuần/tháng, lịch sử, năng lực.
- Settings: đổi tên, thông báo, dark mode, English mode, localStorage.


## Nguồn media
- Mascot rùa: `assets/turtle-mascot.webp` và `assets/turtle-mascot.png`; icon PWA: `assets/smart-student-icon.png`.
- Ảnh quà đổi thưởng: `assets/reward-ueh-polo.png`, `reward-ueh-notebook.png`, `reward-ueh-keychain.png`, `reward-ueh-tote.png`.
- Khu vực Bài giảng & Tài liệu dùng liên kết YouTube/playlist theo nguồn; tài liệu ngoài được liên kết tới trang nguồn như Studocu thay vì sao chép nội dung có bản quyền.


## v2.4 updates
- Removed the horizontal top feature toolbar; navigation stays in the left sidebar.
- Replaced mascot image dependency with an inline SVG turtle mascot (glasses + graduation cap) so it cannot break from missing image paths.
- Removed souvenir product images from Game Center; rewards use symbolic icons only.
- Rebuilt the eight game modes as distinct experiences: Quiz, Flashcard, Word Search Puzzle, Drag/Drop Speed Arena, Crossword, Escape-room Daily Challenge, Turtle Lane Race, and Picture Riddle by Subject.
- Each game mode has separate subject-specific content for Microeconomics, Applied Mathematics, General English, Business Law, and Design Thinking.
- Service-worker cache bumped to v24 to prevent stale cached UI/assets from reappearing.


## v3.2 patch
- Study-group conversations are separated by subject and use subject-specific quick answers before AI fallback.
- Trusted Lecturer profiles are explicitly fictional/mock profiles and no longer reuse schedule/material teacher names.
- Lecture filters use the lecturer/presenter names attached to each YouTube source/search.
- Added more deadline starter tasks; existing localStorage users receive missing starter items automatically.
- Method cards now open a step-by-step table tailored to the selected subject.


## v3.2 updates
- Materials only show a named instructor when the YouTube source/title verifies the instructor name; otherwise the card explicitly says the instructor is unverified.
- Game timeout feedback now shows the correct answer, explanation, mistake diagnosis, ability level, and subject-specific improvement advice for timed games.
- Quiz timeout/wrong-answer feedback also includes the verified answer and a live ability indicator.
- Service Worker cache bumped to v29.

## v3.2 fixes
- Khôi phục Puzzle kiến thức dạng Word Search hoạt động và hiển thị vị trí chính xác của từ chưa tìm thấy sau khi nộp.
- Khôi phục/hoàn thiện Tính điểm; có GPA và điểm trung bình, kèm bảng tổng hợp 5 môn.
- Thử thách hằng ngày không hiển thị đáp án trong bước Giải mật mã; đáp án chỉ xuất hiện ở phần kết quả sau khi nộp.
