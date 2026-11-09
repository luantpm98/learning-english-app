export type BuiltInVocabWord = {
  id: number;
  word: string;
  phonetic: string;
  translation: string;
  definition: string;
  level?: string;
  topic?: string;
};

export type BuiltInVocabSet = {
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  badge: string;
  words: BuiltInVocabWord[];
};

export const BUILTIN_VOCAB_SETS: BuiltInVocabSet[] = [
  {
    id: 101,
    name: "Giao Tiếp Phản Xạ Hàng Ngày (Core Conversational)",
    description: "Những từ và cụm từ tần suất cao nhất giúp bạn tự tin mở lời, bắt chuyện và phản xạ tự nhiên.",
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&q=80",
    badge: "A2–B1 · Giao tiếp",
    words: [
      { id: 10101, word: "available", phonetic: "/əˈveɪləbl/", translation: "có sẵn, rảnh rỗi", definition: "Are you available for a quick call this afternoon? (Chiều nay bạn có rảnh gọi điện nhanh không?)" },
      { id: 10102, word: "recommend", phonetic: "/ˌrekəˈmend/", translation: "gợi ý, giới thiệu", definition: "Could you recommend a good local restaurant nearby? (Bạn có thể gợi ý một nhà hàng địa phương ngon gần đây không?)" },
      { id: 10103, word: "appreciate", phonetic: "/əˈpriːʃieɪt/", translation: "trân trọng, cảm kích", definition: "I really appreciate your help with this project. (Tôi thực sự cảm kích sự giúp đỡ của bạn với dự án này.)" },
      { id: 10104, word: "definitely", phonetic: "/ˈdefɪnətli/", translation: "chắc chắn rồi", definition: "I will definitely join you guys for dinner tonight! (Chắc chắn tối nay tôi sẽ đi ăn tối cùng mọi người!)" },
      { id: 10105, word: "actually", phonetic: "/ˈæktʃuəli/", translation: "thực ra là", definition: "Actually, I have lived in Ho Chi Minh City for five years. (Thực ra tôi đã sống ở TP.HCM được 5 năm rồi.)" },
      { id: 10106, word: "convenient", phonetic: "/kənˈviːniənt/", translation: "thuận tiện, tiện lợi", definition: "What time would be most convenient for you? (Mấy giờ thì thuận tiện nhất cho bạn?)" },
      { id: 10107, word: "experience", phonetic: "/ɪkˈspɪəriəns/", translation: "kinh nghiệm, trải nghiệm", definition: "Traveling alone was an unforgettable experience for me. (Đi du lịch một mình là một trải nghiệm khó quên đối với tôi.)" },
      { id: 10108, word: "opportunity", phonetic: "/ˌɒpəˈtjuːnəti/", translation: "cơ hội", definition: "Thank you for giving me the opportunity to interview today. (Cảm ơn vì đã cho tôi cơ hội phỏng vấn hôm nay.)" },
      { id: 10109, word: "schedule", phonetic: "/ˈʃedjuːl/", translation: "lịch trình, sắp xếp lịch", definition: "Let me check my schedule and get back to you soon. (Để tôi kiểm tra lại lịch trình rồi báo lại bạn sớm nhé.)" },
      { id: 10110, word: "impression", phonetic: "/ɪmˈpreʃn/", translation: "ấn tượng", definition: "She made a great first impression on the whole team. (Cô ấy đã tạo ấn tượng đầu tiên rất tốt với cả nhóm.)" },
      { id: 10111, word: "confident", phonetic: "/ˈkɒnfɪdənt/", translation: "tự tin", definition: "Practice speaking every day so you can feel more confident. (Hãy luyện nói mỗi ngày để bạn cảm thấy tự tin hơn.)" },
      { id: 10112, word: "exhausted", phonetic: "/ɪɡˈzɔːstɪd/", translation: "kiệt sức, mệt nhoài", definition: "I am completely exhausted after a long day at work. (Tôi hoàn toàn kiệt sức sau một ngày dài làm việc.)" },
      { id: 10113, word: "flexible", phonetic: "/ˈfleksəbl/", translation: "linh hoạt", definition: "My working hours are quite flexible this week. (Giờ làm việc của tôi tuần này khá linh hoạt.)" },
      { id: 10114, word: "suggestion", phonetic: "/səˈdʒestʃən/", translation: "đề xuất, gợi ý", definition: "Do you have any suggestions for our weekend trip? (Bạn có gợi ý nào cho chuyến đi cuối tuần của chúng ta không?)" },
      { id: 10115, word: "misunderstand", phonetic: "/ˌmɪsʌndəˈstænd/", translation: "hiểu lầm", definition: "Don't misunderstand me, I think your idea is great. (Đừng hiểu lầm tôi, tôi nghĩ ý tưởng của bạn rất tuyệt.)" },
      { id: 10116, word: "hang out", phonetic: "/hæŋ aʊt/", translation: "đi chơi, tụ tập bạn bè", definition: "Where do you usually hang out with your friends on weekends? (Cuối tuần bạn thường đi chơi ở đâu với bạn bè?)" },
      { id: 10117, word: "catch up", phonetic: "/kætʃ ʌp/", translation: "hàn huyên, cập nhật tình hình", definition: "Let's grab a coffee and catch up sometime this week! (Tuần này đi cà phê hàn huyên nhé!)" },
      { id: 10118, word: "figure out", phonetic: "/ˈfɪɡər aʊt/", translation: "tìm ra cách giải quyết, hiểu ra", definition: "We need to figure out how to solve this problem quickly. (Chúng ta cần tìm ra cách giải quyết vấn đề này nhanh chóng.)" },
      { id: 10119, word: "look forward to", phonetic: "/lʊk ˈfɔːwəd tuː/", translation: "mong đợi, hào hứng chờ đón", definition: "I really look forward to meeting you in person. (Tôi rất mong được gặp trực tiếp bạn.)" },
      { id: 10120, word: "make sense", phonetic: "/meɪk sens/", translation: "hợp lý, dễ hiểu", definition: "Does that make sense to you, or should I explain again? (Điều đó có dễ hiểu với bạn không, hay để tôi giải thích lại?)" }
    ],
  },
  {
    id: 102,
    name: "Tiếng Anh Công Sở & Phỏng Vấn (Business & Career)",
    description: "Từ vựng chuyên nghiệp để phỏng vấn xin việc, họp nhóm, thuyết trình và viết email công việc.",
    thumbnail: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=500&q=80",
    badge: "B1–B2 · Công sở",
    words: [
      { id: 10201, word: "deadline", phonetic: "/ˈdedlaɪn/", translation: "hạn chót", definition: "We need to submit the final report before Friday's deadline. (Chúng ta cần nộp báo cáo cuối cùng trước hạn chót thứ Sáu.)" },
      { id: 10202, word: "collaborate", phonetic: "/kəˈlæbəreɪt/", translation: "hợp tác, phối hợp", definition: "Our marketing team will collaborate closely with the design department. (Đội marketing sẽ phối hợp chặt chẽ với bộ phận thiết kế.)" },
      { id: 10203, word: "negotiate", phonetic: "/nɪˈɡəʊʃieɪt/", translation: "đàm phán, thương lượng", definition: "We managed to negotiate a better contract with the supplier. (Chúng tôi đã đàm phán được một hợp đồng tốt hơn với nhà cung cấp.)" },
      { id: 10204, word: "priority", phonetic: "/praɪˈɒrəti/", translation: "ưu tiên hàng đầu", definition: "Customer satisfaction is always our top priority. (Sự hài lòng của khách hàng luôn là ưu tiên hàng đầu của chúng tôi.)" },
      { id: 10205, word: "feedback", phonetic: "/ˈfiːdbæk/", translation: "phản hồi, góp ý", definition: "Could you give me some feedback on my presentation slides? (Bạn có thể góp ý cho slide thuyết trình của tôi được không?)" },
      { id: 10206, word: "objective", phonetic: "/əbˈdʒektɪv/", translation: "mục tiêu", definition: "Our main objective this quarter is to increase user retention. (Mục tiêu chính quý này là tăng tỷ lệ giữ chân người dùng.)" },
      { id: 10207, word: "postpone", phonetic: "/pəˈspəʊn/", translation: "hoãn lại, dời lịch", definition: "Can we postpone our meeting until tomorrow morning? (Chúng ta có thể dời cuộc họp sang sáng mai được không?)" },
      { id: 10208, word: "confirm", phonetic: "/kənˈfɜːm/", translation: "xác nhận", definition: "Please send an email to confirm your attendance. (Vui lòng gửi email để xác nhận sự tham dự của bạn.)" },
      { id: 10209, word: "agenda", phonetic: "/əˈdʒendə/", translation: "chương trình cuộc họp", definition: "There are three important items on today's meeting agenda. (Có 3 mục quan trọng trong chương trình họp hôm nay.)" },
      { id: 10210, word: "productive", phonetic: "/prəˈdʌktɪv/", translation: "hiệu quả, năng suất", definition: "Thank you everyone for a very productive discussion today. (Cảm ơn mọi người vì buổi thảo luận rất hiệu quả hôm nay.)" },
      { id: 10211, word: "strategy", phonetic: "/ˈstrætədʒi/", translation: "chiến lược", definition: "We are developing a new growth strategy for the Asian market. (Chúng tôi đang phát triển chiến lược tăng trưởng mới cho thị trường châu Á.)" },
      { id: 10212, word: "budget", phonetic: "/ˈbʌdʒɪt/", translation: "ngân sách", definition: "The project was completed on time and under budget. (Dự án đã hoàn thành đúng hạn và trong ngân sách.)" },
      { id: 10213, word: "promote", phonetic: "/prəˈməʊt/", translation: "thăng chức / quảng bá", definition: "She was promoted to Senior Project Manager last month. (Cô ấy đã được thăng chức lên Quản lý Dự án Cấp cao tháng trước.)" },
      { id: 10214, word: "candidate", phonetic: "/ˈkændɪdət/", translation: "ứng viên", definition: "He is the strongest candidate for the software engineer position. (Anh ấy là ứng viên sáng giá nhất cho vị trí kỹ sư phần mềm.)" },
      { id: 10215, word: "follow up", phonetic: "/ˈfɒləʊ ʌp/", translation: "theo sát, phản hồi tiếp nối", definition: "I am writing to follow up on our conversation yesterday. (Tôi viết thư này để tiếp nối cuộc trao đổi của chúng ta hôm qua.)" },
      { id: 10216, word: "touch base", phonetic: "/tʌtʃ beɪs/", translation: "liên lạc nhanh để cập nhật", definition: "Let's touch base next Monday to check on the progress. (Thứ Hai tới chúng ta trao đổi nhanh để kiểm tra tiến độ nhé.)" }
    ],
  },
  {
    id: 103,
    name: "Du Lịch, Sân Bay & Nhà Hàng (Travel & Survival)",
    description: "Trọn bộ từ vựng sinh tồn khi đi du lịch nước ngoài, làm thủ tục sân bay, khách sạn và gọi món.",
    thumbnail: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&q=80",
    badge: "A2–B1 · Du lịch",
    words: [
      { id: 10301, word: "reservation", phonetic: "/ˌrezəˈveɪʃn/", translation: "sự đặt chỗ trước (bàn/phòng)", definition: "Hello, I have a hotel reservation under the name Tran. (Xin chào, tôi có đặt phòng trước dưới tên Trần.)" },
      { id: 10302, word: "boarding pass", phonetic: "/ˈbɔːdɪŋ pɑːs/", translation: "thẻ lên máy bay", definition: "May I see your passport and boarding pass, please? (Cho tôi xem hộ chiếu và thẻ lên máy bay của bạn nhé?)" },
      { id: 10303, word: "itinerary", phonetic: "/aɪˈtɪnərəri/", translation: "lịch trình chuyến đi", definition: "I will send you our full travel itinerary tonight. (Tối nay tôi sẽ gửi cho bạn toàn bộ lịch trình chuyến đi.)" },
      { id: 10304, word: "luggage", phonetic: "/ˈlʌɡɪdʒ/", translation: "hành lý", definition: "Where can I claim my checked luggage? (Tôi có thể nhận hành lý ký gửi ở đâu?)" },
      { id: 10305, word: "souvenir", phonetic: "/ˌsuːvəˈnɪə(r)/", translation: "quà lưu niệm", definition: "I bought some handmade souvenirs for my family. (Tôi đã mua vài món quà lưu niệm thủ công cho gia đình.)" },
      { id: 10306, word: "destination", phonetic: "/ˌdestɪˈneɪʃn/", translation: "điểm đến", definition: "Da Nang is a very popular tourist destination in Vietnam. (Đà Nẵng là một điểm đến du lịch rất nổi tiếng ở Việt Nam.)" },
      { id: 10307, word: "accommodation", phonetic: "/əˌkɒməˈdeɪʃn/", translation: "chỗ ở (khách sạn, homestay)", definition: "Have you booked your accommodation in Tokyo yet? (Bạn đã đặt chỗ ở tại Tokyo chưa?)" },
      { id: 10308, word: "specialty", phonetic: "/ˈspeʃəlti/", translation: "món đặc sản", definition: "What is the local specialty of this restaurant? (Món đặc sản của nhà hàng này là gì vậy?)" },
      { id: 10309, word: "allergic", phonetic: "/əˈlɜːdʒɪk/", translation: "bị dị ứng", definition: "Does this dish contain peanuts? I am allergic to nuts. (Món này có đậu phộng không? Tôi bị dị ứng với các loại hạt.)" },
      { id: 10310, word: "appetizer", phonetic: "/ˈæpɪtaɪzə(r)/", translation: "món khai vị", definition: "Would you like to order any appetizers before the main course? (Bạn có muốn gọi món khai vị trước món chính không?)" },
      { id: 10311, word: "complimentary", phonetic: "/ˌkɒmplɪˈmentri/", translation: "miễn phí (đi kèm dịch vụ)", definition: "The hotel offers complimentary breakfast every morning. (Khách sạn phục vụ bữa sáng miễn phí mỗi sáng.)" },
      { id: 10312, word: "currency", phonetic: "/ˈkʌrənsi/", translation: "tiền tệ", definition: "Where is the best place to exchange foreign currency? (Đổi ngoại tệ ở đâu là tốt nhất nhỉ?)" }
    ],
  },
];

export type RoleplayLine = {
  speaker: "A" | "B";
  roleName: string;
  en: string;
  vi: string;
  tip?: string;
};

export type RoleplayScenario = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  level: string;
  situation: string;
  lines: RoleplayLine[];
};

export const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  {
    id: "coffee-shop",
    title: "Gọi đồ uống tại quán Cà Phê",
    subtitle: "At the Coffee Shop",
    icon: "☕",
    level: "A2 · Cơ bản",
    situation: "Bạn đang ở quán cà phê nước ngoài. Nhân viên pha chế (A) hỏi bạn muốn dùng gì, bạn (B) gọi món và thanh toán.",
    lines: [
      { speaker: "A", roleName: "Barista", en: "Hi there! What can I get started for you today?", vi: "Xin chào! Hôm nay tôi có thể làm món gì cho bạn nhỉ?" },
      { speaker: "B", roleName: "Bạn", en: "Hi! Could I get a medium iced latte with oat milk, please?", vi: "Chào bạn! Cho mình một ly latte đá cỡ vừa dùng sữa yến mạch nhé.", tip: "Dùng 'Could I get... please?' nghe lịch sự và tự nhiên như người bản xứ." },
      { speaker: "A", roleName: "Barista", en: "Sure thing! Would you like any sweetener or syrup in that?", vi: "Được chứ! Bạn có muốn thêm đường hay si-rô gì không?" },
      { speaker: "B", roleName: "Bạn", en: "Just half sugar, please. And can I also have a blueberry muffin?", vi: "Cho mình nửa đường thôi nhé. Và lấy thêm cho mình một bánh muffin việt quất nữa.", tip: "'Half sugar' hoặc 'Less sweet' rất hay dùng khi gọi đồ uống." },
      { speaker: "A", roleName: "Barista", en: "Got it. Is that for here or to go?", vi: "Rồi ạ. Bạn dùng tại quán hay mang đi?" },
      { speaker: "B", roleName: "Bạn", en: "For here, please. Can I pay by credit card?", vi: "Mình dùng tại quán nhé. Mình thanh toán bằng thẻ tín dụng được không?", tip: "'For here' = uống tại quán; 'To go' / 'Takeaway' = mang đi." },
    ],
  },
  {
    id: "job-interview",
    title: "Phỏng vấn xin việc bằng Tiếng Anh",
    subtitle: "Job Interview",
    icon: "💼",
    level: "B1–B2 · Công sở",
    situation: "Nhà tuyển dụng (A) phỏng vấn bạn (B) về kinh nghiệm làm việc, điểm mạnh và lý do ứng tuyển.",
    lines: [
      { speaker: "A", roleName: "Interviewer", en: "Welcome! To start off, could you tell me a little bit about yourself?", vi: "Chào mừng bạn! Để bắt đầu, bạn có thể giới thiệu đôi chút về bản thân không?" },
      { speaker: "B", roleName: "Bạn", en: "Thank you for having me. I have over three years of experience in project management and customer operations.", vi: "Cảm ơn anh/chị đã dành thời gian. Tôi có hơn 3 năm kinh nghiệm trong quản lý dự án và vận hành khách hàng.", tip: "Mở đầu bằng 'Thank you for having me' tạo thiện cảm rất chuyên nghiệp." },
      { speaker: "A", roleName: "Interviewer", en: "That sounds impressive. What would you say is your greatest strength at work?", vi: "Nghe rất ấn tượng. Theo bạn, điểm mạnh lớn nhất của bạn trong công việc là gì?" },
      { speaker: "B", roleName: "Bạn", en: "I am a fast learner and I always stay calm under pressure to solve problems effectively.", vi: "Tôi là người học hỏi nhanh và luôn giữ bình tĩnh dưới áp lực để giải quyết vấn đề hiệu quả." },
      { speaker: "A", roleName: "Interviewer", en: "Why do you want to join our company at this stage of your career?", vi: "Tại sao bạn muốn gia nhập công ty chúng tôi ở giai đoạn này?" },
      { speaker: "B", roleName: "Bạn", en: "I really admire your innovative products, and I want to contribute my skills to help the team grow.", vi: "Tôi rất ngưỡng mộ các sản phẩm sáng tạo của công ty và muốn đóng góp kỹ năng của mình để cùng đội ngũ phát triển." },
    ],
  },
  {
    id: "airport-check-in",
    title: "Làm thủ tục tại Sân bay & Hải quan",
    subtitle: "Airport & Immigration",
    icon: "✈️",
    level: "A2–B1 · Du lịch",
    situation: "Bạn (B) đang làm thủ tục check-in chuyến bay quốc tế và trả lời nhân viên sân bay (A).",
    lines: [
      { speaker: "A", roleName: "Officer", en: "Good morning. May I see your passport and ticket, please?", vi: "Chào buổi sáng. Cho tôi xem hộ chiếu và vé của bạn nhé?" },
      { speaker: "B", roleName: "Bạn", en: "Good morning! Here is my passport. Could I have a window seat if possible?", vi: "Chào buổi sáng! Hộ chiếu của tôi đây ạ. Nếu được thì cho tôi xin ghế cạnh cửa sổ nhé?", tip: "'Window seat' = ghế cửa sổ; 'Aisle seat' = ghế lối đi." },
      { speaker: "A", roleName: "Officer", en: "Let me check... Yes, I have put you in 14A by the window. Are you checking any bags?", vi: "Để tôi kiểm tra... Được nhé, tôi đã xếp bạn ghế 14A cạnh cửa sổ. Bạn có ký gửi hành lý nào không?" },
      { speaker: "B", roleName: "Bạn", en: "Yes, just this one suitcase, and I have one carry-on backpack.", vi: "Có, chỉ một chiếc vali này thôi, và tôi có một ba lô xách tay." },
      { speaker: "A", roleName: "Officer", en: "Here is your boarding pass. Your flight boards at Gate 22 at 10:30 AM.", vi: "Thẻ lên máy bay của bạn đây. Chuyến bay bắt đầu lên tàu tại Cổng 22 lúc 10:30 sáng." },
      { speaker: "B", roleName: "Bạn", en: "Thank you so much! Which way is security check from here?", vi: "Cảm ơn bạn rất nhiều! Từ đây đi lối nào ra khu kiểm tra an ninh vậy ạ?" },
    ],
  },
  {
    id: "small-talk",
    title: "Bắt chuyện & Làm quen bạn mới",
    subtitle: "Making Small Talk",
    icon: "🤝",
    level: "A2 · Giao tiếp",
    situation: "Bạn (B) gặp một đồng nghiệp hoặc người bạn nước ngoài mới (A) tại một sự kiện giao lưu.",
    lines: [
      { speaker: "A", roleName: "Alex", en: "Hi! I don't think we've met before. I'm Alex.", vi: "Chào bạn! Hình như chúng ta chưa gặp nhau trước đây. Mình là Alex." },
      { speaker: "B", roleName: "Bạn", en: "Nice to meet you, Alex! How is your week going so far?", vi: "Rất vui được gặp bạn, Alex! Tuần này của bạn thế nào rồi?", tip: "'How is your week going so far?' là câu mở đầu cực kỳ tự nhiên." },
      { speaker: "A", roleName: "Alex", en: "Pretty busy, but good! Is this your first time attending this event?", vi: "Khá bận nhưng vui lắm! Đây là lần đầu bạn tham gia sự kiện này à?" },
      { speaker: "B", roleName: "Bạn", en: "Yes, it's my first time here. Everything has been really interesting so far.", vi: "Đúng rồi, đây là lần đầu mình tới đây. Mọi thứ tính đến giờ đều rất thú vị." },
      { speaker: "A", roleName: "Alex", en: "What do you usually like to do in your free time on weekends?", vi: "Cuối tuần rảnh rỗi bạn thường thích làm gì?" },
      { speaker: "B", roleName: "Bạn", en: "I love exploring coffee shops, working out, and watching English movies.", vi: "Mình thích khám phá các quán cà phê, tập thể dục và xem phim tiếng Anh." },
    ],
  },
  {
    id: "daily-standup",
    title: "Họp nhóm báo cáo tiến độ (Daily Meeting)",
    subtitle: "Team Stand-up & Meeting",
    icon: "📊",
    level: "B1–B2 · Công sở",
    situation: "Trưởng nhóm (A) hỏi bạn (B) cập nhật công việc hôm qua, kế hoạch hôm nay và các vướng mắc.",
    lines: [
      { speaker: "A", roleName: "Team Lead", en: "Morning everyone! Could you give us a quick update on your tasks?", vi: "Chào buổi sáng mọi người! Bạn cập nhật nhanh về công việc đang làm nhé?" },
      { speaker: "B", roleName: "Bạn", en: "Yesterday I finished testing the new feature, and today I will deploy it to staging.", vi: "Hôm qua tôi đã hoàn thành kiểm thử tính năng mới, và hôm nay tôi sẽ triển khai lên môi trường thử nghiệm." },
      { speaker: "A", roleName: "Team Lead", en: "Great progress! Are you facing any blockers or delays right now?", vi: "Tiến độ tốt lắm! Hiện tại bạn có gặp vướng mắc hay chậm trễ nào không?" },
      { speaker: "B", roleName: "Bạn", en: "Everything is on track, I just need a quick design review from Sarah this afternoon.", vi: "Mọi thứ vẫn đúng tiến độ, tôi chỉ cần Sarah duyệt nhanh phần thiết kế vào chiều nay thôi." },
      { speaker: "A", roleName: "Team Lead", en: "Awesome. Let's sync up again tomorrow morning.", vi: "Tuyệt vời. Sáng mai chúng ta cập nhật tiếp nhé." },
      { speaker: "B", roleName: "Bạn", en: "Sounds good to me. Thanks everyone!", vi: "Nghe ổn đấy ạ. Cảm ơn mọi người!" },
    ],
  },
];

export type EssentialPhraseItem = {
  id: number;
  category: string;
  text: string;
  translation: string;
  usage: string;
};

export const ESSENTIAL_PHRASES: EssentialPhraseItem[] = [
  { id: 9001, category: "Phản xạ cửa miệng", text: "That makes total sense.", translation: "Nghe hoàn toàn hợp lý / Dễ hiểu mà.", usage: "Dùng khi đồng tình và hiểu rõ ý người đối diện" },
  { id: 9002, category: "Phản xạ cửa miệng", text: "Let me think about it for a second.", translation: "Để mình suy nghĩ một chút nhé.", usage: "Câu câu giờ tự nhiên khi chưa kịp nghĩ ra câu trả lời" },
  { id: 9003, category: "Phản xạ cửa miệng", text: "I was just about to say that!", translation: "Mình cũng vừa định nói câu đó luôn!", usage: "Thể hiện sự đồng điệu trong cuộc trò chuyện" },
  { id: 9004, category: "Phản xạ cửa miệng", text: "It's up to you, I'm easy.", translation: "Tùy bạn chọn đấy, mình sao cũng được.", usage: "Dùng khi bạn bè hỏi ăn gì, đi đâu" },
  { id: 9005, category: "Hỏi lại lịch sự", text: "Sorry, I didn't quite catch that. Could you repeat it?", translation: "Xin lỗi mình nghe chưa rõ lắm. Bạn nhắc lại giúp mình nhé?", usage: "Khi người bản xứ nói quá nhanh" },
  { id: 9006, category: "Hỏi lại lịch sự", text: "What do you mean by that?", translation: "Ý của bạn là sao nhỉ?", usage: "Khi muốn người nói giải thích rõ hơn" },
  { id: 9007, category: "Công sở & Họp hành", text: "Just to make sure we're on the same page...", translation: "Để đảm bảo chúng ta hiểu thống nhất với nhau...", usage: "Dùng khi chốt lại ý kiến trong cuộc họp" },
  { id: 9008, category: "Công sở & Họp hành", text: "I'll get back to you on this by the end of the day.", translation: "Tôi sẽ phản hồi lại bạn về việc này trước cuối ngày hôm nay.", usage: "Câu trả lời chuyên nghiệp khi cần kiểm tra thêm thông tin" },
  { id: 9009, category: "Công sở & Họp hành", text: "Could you keep me in the loop?", translation: "Nhớ cập nhật thông tin tình hình cho tôi cùng nắm nhé!", usage: "Nhờ đồng nghiệp thông báo tiến độ công việc" },
  { id: 9010, category: "Du lịch & Đời sống", text: "Excuse me, how do I get to the nearest subway station?", translation: "Cho tôi hỏi thăm đường ra ga tàu điện ngầm gần nhất với ạ?", usage: "Hỏi đường khi đi du lịch" },
  { id: 9011, category: "Du lịch & Đời sống", text: "Could we have the bill, please?", translation: "Cho tụi mình xin hóa đơn thanh toán nhé!", usage: "Gọi tính tiền tại nhà hàng" },
  { id: 9012, category: "Du lịch & Đời sống", text: "Thank you in advance for your help!", translation: "Cảm ơn sự giúp đỡ của bạn trước nhé!", usage: "Kết thúc lời nhờ vả lịch sự" },
];
