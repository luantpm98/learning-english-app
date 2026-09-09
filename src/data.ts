export type Topic = { id: string; name: string; color: string };
export type Channel = { id: string; name: string; avatar: string; youtubeChannelId?: string };
export type Subtitle = { id: string; start: number; end: number; en: string; vi: string };
export type Video = {
  id: string; youtubeId: string; title: string; topicId: string; channelId: string;
  duration: string; thumbnail: string; subtitles: Subtitle[];
};
export type VocabWord = {
  id: string; word: string; phonetic: string; meaning: string; example: string;
  nextReview: string; level: number; image?: string; collectionId?: string;
};
export type Phrase = { id: string; en: string; vi: string; category: string; saved: boolean };
export type WordCollection = { id: string; name: string; description: string; wordCount: number; color: string };

export const topics: Topic[] = [
  { id: "t1", name: "Business English", color: "#818cf8" },
  { id: "t2", name: "Daily Conversation", color: "#4ade80" },
  { id: "t3", name: "Travel & Tourism", color: "#f59e0b" },
  { id: "t4", name: "Technology", color: "#38bdf8" },
  { id: "t5", name: "News & Current Events", color: "#f472b6" },
];

export const defaultChannels: Channel[] = [
  { id: "c1", name: "EnglishPod", avatar: "EP" },
  { id: "c2", name: "BBC Learning English", avatar: "BB" },
  { id: "c3", name: "TED-Ed", avatar: "TE" },
  { id: "c4", name: "Rachel's English", avatar: "RE" },
];

export const defaultVideos: Video[] = [
  {
    id: "v1", youtubeId: "dQw4w9WgXcQ",
    title: "How to Introduce Yourself Professionally",
    topicId: "t1", channelId: "c1", duration: "8:42",
    thumbnail: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=480&h=270&fit=crop&auto=format",
    subtitles: [
      { id: "s1", start: 0, end: 4, en: "Hi everyone, welcome to today's lesson.", vi: "Xin chào mọi người, chào mừng đến với bài học hôm nay." },
      { id: "s2", start: 4, end: 9, en: "Today we're going to learn how to introduce yourself in a professional setting.", vi: "Hôm nay chúng ta sẽ học cách tự giới thiệu bản thân trong môi trường chuyên nghiệp." },
      { id: "s3", start: 9, end: 15, en: "First impressions matter a lot in business environments.", vi: "Ấn tượng đầu tiên rất quan trọng trong môi trường kinh doanh." },
      { id: "s4", start: 15, end: 22, en: "It is a pleasure to meet you.", vi: "Rất vui được gặp bạn." },
      { id: "s5", start: 22, end: 30, en: "You can follow that with your name and your role in the company.", vi: "Bạn có thể tiếp tục bằng tên và vị trí của bạn trong công ty." },
      { id: "s6", start: 30, end: 38, en: "I am Sarah Chen the marketing director at TechCorp.", vi: "Tôi là Sarah Chen, giám đốc marketing tại TechCorp." },
      { id: "s7", start: 38, end: 45, en: "Notice how I included both my name and my title in one short sentence.", vi: "Chú ý cách tôi kết hợp cả tên và chức danh trong một câu ngắn gọn." },
      { id: "s8", start: 45, end: 52, en: "Now let's practice the handshake greeting.", vi: "Bây giờ hãy luyện tập lời chào bắt tay." },
    ],
  },
  {
    id: "v2", youtubeId: "GSD0oHAF7S0",
    title: "Small Talk Secrets: Never Run Out of Things to Say",
    topicId: "t2", channelId: "c2", duration: "12:15",
    thumbnail: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=480&h=270&fit=crop&auto=format",
    subtitles: [
      { id: "s1", start: 0, end: 5, en: "Small talk is the glue that holds social interactions together.", vi: "Nói chuyện phiếm là sợi dây kết nối các tương tác xã hội." },
      { id: "s2", start: 5, end: 12, en: "But for many people starting a conversation feels incredibly awkward.", vi: "Nhưng đối với nhiều người, bắt đầu một cuộc trò chuyện cảm thấy cực kỳ ngại ngùng." },
      { id: "s3", start: 12, end: 19, en: "The secret is to ask open ended questions that invite stories.", vi: "Bí quyết là đặt câu hỏi mở mời gọi câu chuyện." },
      { id: "s4", start: 19, end: 26, en: "What is the most interesting place you have visited.", vi: "Nơi thú vị nhất bạn từng đến là đâu?" },
      { id: "s5", start: 26, end: 34, en: "This technique is called the FORD method which stands for Family Occupation Recreation and Dreams.", vi: "Kỹ thuật này được gọi là phương pháp FORD — Gia đình, Nghề nghiệp, Giải trí và Ước mơ." },
    ],
  },
  {
    id: "v3", youtubeId: "pS1D9ZXSB3c",
    title: "American Pronunciation: The R Sound Mastered",
    topicId: "t2", channelId: "c4", duration: "10:30",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=480&h=270&fit=crop&auto=format",
    subtitles: [
      { id: "s1", start: 0, end: 6, en: "The American R sound is one of the most difficult sounds for non native speakers.", vi: "Âm R trong tiếng Anh Mỹ là một trong những âm khó nhất đối với người không phải bản ngữ." },
      { id: "s2", start: 6, end: 14, en: "The key is to curl your tongue back without touching the roof of your mouth.", vi: "Chìa khóa là cuộn lưỡi ra sau mà không chạm vào vòm miệng." },
      { id: "s3", start: 14, end: 20, en: "Let us practice with the word world and notice how the R colors the entire vowel.", vi: "Hãy luyện tập với từ world và chú ý cách âm R tô màu toàn bộ nguyên âm." },
    ],
  },
  {
    id: "v4", youtubeId: "9bZkp7q19f0",
    title: "Tech Startup Vocabulary: Words You Need to Know",
    topicId: "t4", channelId: "c3", duration: "15:20",
    thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=480&h=270&fit=crop&auto=format",
    subtitles: [
      { id: "s1", start: 0, end: 7, en: "The startup world has its own unique vocabulary that can feel like a foreign language.", vi: "Thế giới startup có vốn từ vựng riêng biệt." },
      { id: "s2", start: 7, end: 15, en: "Words like pivot disruptive and scalable are thrown around constantly in Silicon Valley.", vi: "Những từ như pivot, disruptive, và scalable được sử dụng liên tục ở Silicon Valley." },
      { id: "s3", start: 15, end: 23, en: "When a startup pivots it means they change their core business strategy in response to market feedback.", vi: "Khi một startup pivot, có nghĩa là họ thay đổi chiến lược kinh doanh cốt lõi theo phản hồi thị trường." },
    ],
  },
];

export const vocabulary: VocabWord[] = [
  { id: "w1", word: "Pivot", phonetic: "/ˈpɪv.ət/", meaning: "Thay đổi chiến lược kinh doanh cốt lõi", example: "The startup decided to pivot from B2C to B2B.", nextReview: "2026-08-30", level: 2 },
  { id: "w2", word: "Disruptive", phonetic: "/dɪˈsrʌp.tɪv/", meaning: "Mang tính phá vỡ, cách mạng", example: "The new app was a disruptive force in the transportation industry.", nextReview: "2026-08-31", level: 1 },
  { id: "w3", word: "Scalable", phonetic: "/ˈskeɪ.lə.bəl/", meaning: "Có khả năng mở rộng quy mô", example: "We need a scalable solution that can handle millions of users.", nextReview: "2026-08-30", level: 3 },
  { id: "w4", word: "Leverage", phonetic: "/ˈlev.ər.ɪdʒ/", meaning: "Tận dụng, sử dụng đòn bẩy", example: "We can leverage our existing customer base to launch the new product.", nextReview: "2026-09-02", level: 2 },
  { id: "w5", word: "Synergy", phonetic: "/ˈsɪn.ər.dʒi/", meaning: "Sức mạnh cộng hưởng", example: "The merger created a powerful synergy between the two companies.", nextReview: "2026-09-01", level: 1 },
  { id: "w6", word: "Awkward", phonetic: "/ˈɔːk.wəd/", meaning: "Khó xử, lúng túng", example: "There was an awkward silence after he made the joke.", nextReview: "2026-08-30", level: 4 },
  { id: "w7", word: "Genuine", phonetic: "/ˈdʒen.ju.ɪn/", meaning: "Chân thật, thực sự", example: "Her smile was genuine and made everyone feel welcome.", nextReview: "2026-09-03", level: 2 },
];

export const phrases: Phrase[] = [
  { id: "p1", en: "Could you please repeat that?", vi: "Bạn có thể lặp lại điều đó không?", category: "Clarification", saved: false },
  { id: "p2", en: "I see what you mean.", vi: "Tôi hiểu ý bạn nói.", category: "Agreement", saved: true },
  { id: "p3", en: "That's a great point.", vi: "Đó là một điểm rất hay.", category: "Agreement", saved: false },
  { id: "p4", en: "Let me think about it.", vi: "Để tôi suy nghĩ về điều đó.", category: "Response", saved: true },
  { id: "p5", en: "I'm not sure I follow.", vi: "Tôi không chắc tôi hiểu đúng.", category: "Clarification", saved: false },
  { id: "p6", en: "It's worth considering.", vi: "Điều đó đáng để xem xét.", category: "Opinion", saved: false },
  { id: "p7", en: "I couldn't agree more.", vi: "Tôi hoàn toàn đồng ý.", category: "Agreement", saved: true },
  { id: "p8", en: "Let's get straight to the point.", vi: "Hãy đi thẳng vào vấn đề.", category: "Business", saved: false },
  { id: "p9", en: "Could we schedule a meeting?", vi: "Chúng ta có thể sắp xếp một cuộc họp không?", category: "Business", saved: false },
  { id: "p10", en: "I'll look into it and get back to you.", vi: "Tôi sẽ tìm hiểu và phản hồi lại cho bạn.", category: "Business", saved: true },
  { id: "p11", en: "What do you think about that?", vi: "Bạn nghĩ sao về điều đó?", category: "Opinion", saved: false },
  { id: "p12", en: "Would you mind if I joined you?", vi: "Bạn có phiền không nếu tôi tham gia?", category: "Permission", saved: false },
  { id: "p13", en: "It's been a while since we last spoke.", vi: "Đã lâu rồi chúng ta không nói chuyện.", category: "Social", saved: false },
  { id: "p14", en: "How have you been keeping?", vi: "Dạo này bạn thế nào?", category: "Social", saved: true },
  { id: "p15", en: "You're absolutely right about that.", vi: "Bạn hoàn toàn đúng về điều đó.", category: "Agreement", saved: false },
];

export const phraseCategories = ["All", "Clarification", "Agreement", "Response", "Opinion", "Business", "Permission", "Social"];

export const wordCollections: WordCollection[] = [
  { id: "col1", name: "1000 Most Common Words", description: "Những từ thiết yếu nhất được dùng hằng ngày, phủ 85% giao tiếp thông thường", wordCount: 1000, color: "#4ade80" },
  { id: "col2", name: "3000 Core Vocabulary", description: "3,000 từ thường gặp nhất, phủ 95% tiếng Anh trong cuộc sống", wordCount: 3000, color: "#818cf8" },
  { id: "col3", name: "Business English", description: "Từ vựng chuyên dụng cho công việc và giao tiếp chuyên nghiệp", wordCount: 500, color: "#38bdf8" },
  { id: "col4", name: "IELTS Academic", description: "Từ vựng học thuật cần thiết cho kỳ thi IELTS và viết học thuật", wordCount: 800, color: "#f59e0b" },
];

// Comprehensive collection words with Unsplash images
export const collectionWords: VocabWord[] = [
  // Nouns with images
  { id: "cw1", word: "Beautiful", phonetic: "/ˈbjuː.tɪ.fəl/", meaning: "Đẹp, xinh đẹp, tuyệt vời", example: "The sunset over the mountains was absolutely beautiful.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },
  { id: "cw2", word: "Freedom", phonetic: "/ˈfriː.dəm/", meaning: "Tự do, sự tự do", example: "She had the freedom to choose her own career path.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },
  { id: "cw3", word: "Journey", phonetic: "/ˈdʒɜː.ni/", meaning: "Hành trình, chuyến đi dài", example: "Life is a journey, not a destination.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },
  { id: "cw4", word: "Knowledge", phonetic: "/ˈnɒl.ɪdʒ/", meaning: "Kiến thức, hiểu biết, tri thức", example: "Knowledge is the key to success in any field.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },
  { id: "cw5", word: "Ocean", phonetic: "/ˈoʊ.ʃən/", meaning: "Đại dương, biển cả rộng lớn", example: "The ocean covers more than 70% of the Earth's surface.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },
  { id: "cw6", word: "Strength", phonetic: "/streŋkθ/", meaning: "Sức mạnh, sức lực, điểm mạnh", example: "Emotional strength is just as important as physical strength.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },
  { id: "cw7", word: "Peaceful", phonetic: "/ˈpiːs.fəl/", meaning: "Bình yên, thanh thản, yên tĩnh", example: "The countryside was peaceful and quiet after the city's noise.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },
  { id: "cw8", word: "Adventure", phonetic: "/ədˈven.tʃər/", meaning: "Cuộc phiêu lưu, trải nghiệm mới mẻ", example: "Backpacking through Asia was the greatest adventure of his life.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1527004013197-933b89dc10d4?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },
  { id: "cw9", word: "Culture", phonetic: "/ˈkʌl.tʃər/", meaning: "Văn hóa, nền văn minh", example: "Learning a language means learning a culture.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },
  { id: "cw10", word: "Confidence", phonetic: "/ˈkɒn.fɪ.dəns/", meaning: "Sự tự tin, lòng tin tưởng vào bản thân", example: "Speaking English daily helped build her confidence.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },
  { id: "cw11", word: "Opportunity", phonetic: "/ˌɒp.əˈtjuː.nɪ.ti/", meaning: "Cơ hội, dịp may thuận lợi", example: "Every challenge is an opportunity in disguise.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },
  { id: "cw12", word: "Friendship", phonetic: "/ˈfrend.ʃɪp/", meaning: "Tình bạn, mối quan hệ bạn bè thân thiết", example: "True friendship is hard to find but worth everything.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },
  { id: "cw13", word: "Mountain", phonetic: "/ˈmaʊn.tɪn/", meaning: "Núi, ngọn núi cao", example: "They hiked to the top of the mountain at sunrise.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },
  { id: "cw14", word: "Forest", phonetic: "/ˈfɒr.ɪst/", meaning: "Rừng, khu rừng rậm rạp", example: "The ancient forest was full of rare birds and plants.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },
  { id: "cw15", word: "City", phonetic: "/ˈsɪt.i/", meaning: "Thành phố, đô thị", example: "New York is one of the most exciting cities in the world.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },
  { id: "cw16", word: "Food", phonetic: "/fuːd/", meaning: "Thức ăn, đồ ăn, thực phẩm", example: "Japanese food is famous for its freshness and presentation.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },
  { id: "cw17", word: "Music", phonetic: "/ˈmjuː.zɪk/", meaning: "Âm nhạc, nhạc", example: "Music is the universal language of mankind.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },
  { id: "cw18", word: "Family", phonetic: "/ˈfæm.ɪ.li/", meaning: "Gia đình, những người thân yêu", example: "Family is the most important thing in her life.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },
  { id: "cw19", word: "Water", phonetic: "/ˈwɔː.tər/", meaning: "Nước, nước uống", example: "Clean water is essential for all forms of life.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },
  { id: "cw20", word: "Light", phonetic: "/laɪt/", meaning: "Ánh sáng, ánh đèn", example: "The morning light filled the room with a warm golden glow.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },

  // col2 - 3000 words
  { id: "cw21", word: "Harmony", phonetic: "/ˈhɑː.mə.ni/", meaning: "Sự hài hòa, hòa hợp, cân bằng", example: "The team worked in perfect harmony to complete the project.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=280&fit=crop&auto=format", collectionId: "col2" },
  { id: "cw22", word: "Resilience", phonetic: "/rɪˈzɪl.i.əns/", meaning: "Sức bật, khả năng phục hồi sau khó khăn", example: "Resilience is the ability to bounce back from adversity.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=400&h=280&fit=crop&auto=format", collectionId: "col2" },
  { id: "cw23", word: "Innovation", phonetic: "/ˌɪn.əˈveɪ.ʃən/", meaning: "Sự đổi mới, sáng tạo đột phá", example: "Innovation drives progress in every industry.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=280&fit=crop&auto=format", collectionId: "col2" },
  { id: "cw24", word: "Determination", phonetic: "/dɪˌtɜː.mɪˈneɪ.ʃən/", meaning: "Sự quyết tâm, ý chí kiên định", example: "Her determination to learn English never wavered.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=280&fit=crop&auto=format", collectionId: "col2" },
  { id: "cw25", word: "Perspective", phonetic: "/pəˈspek.tɪv/", meaning: "Quan điểm, góc nhìn, cách nhìn nhận", example: "Travel gives you a new perspective on life.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=400&h=280&fit=crop&auto=format", collectionId: "col2" },
  { id: "cw26", word: "Enthusiasm", phonetic: "/ɪnˈθjuː.zi.æz.əm/", meaning: "Sự nhiệt tình, hăng hái, hào hứng", example: "His enthusiasm for learning was contagious.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=280&fit=crop&auto=format", collectionId: "col2" },
  { id: "cw27", word: "Solitude", phonetic: "/ˈsɒl.ɪ.tjuːd/", meaning: "Sự cô đơn (một mình, yên tĩnh)", example: "She enjoyed moments of solitude in the quiet garden.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1499084732479-de2c02d45fc4?w=400&h=280&fit=crop&auto=format", collectionId: "col2" },
  { id: "cw28", word: "Remarkable", phonetic: "/rɪˈmɑː.kə.bəl/", meaning: "Đáng chú ý, phi thường, đặc biệt", example: "She made a remarkable recovery after the accident.", nextReview: "2026-08-30", level: 0, collectionId: "col2" },
  { id: "cw29", word: "Persevere", phonetic: "/ˌpɜː.sɪˈvɪər/", meaning: "Kiên trì, bền bỉ tiếp tục dù khó khăn", example: "You must persevere through the tough times to reach your goals.", nextReview: "2026-08-30", level: 0, collectionId: "col2" },
  { id: "cw30", word: "Profound", phonetic: "/prəˈfaʊnd/", meaning: "Sâu sắc, thâm thúy, có chiều sâu", example: "Reading that book had a profound impact on her life.", nextReview: "2026-08-30", level: 0, collectionId: "col2" },
  { id: "cw31", word: "Eloquent", phonetic: "/ˈel.ə.kwənt/", meaning: "Hùng hồn, biểu đạt lưu loát và thuyết phục", example: "The eloquent speaker captivated the entire audience.", nextReview: "2026-08-30", level: 0, collectionId: "col2" },
  { id: "cw32", word: "Ambiguous", phonetic: "/æmˈbɪɡ.ju.əs/", meaning: "Mơ hồ, có thể hiểu theo nhiều nghĩa", example: "The contract language was ambiguous and caused confusion.", nextReview: "2026-08-30", level: 0, collectionId: "col2" },
  { id: "cw33", word: "Flourish", phonetic: "/ˈflʌr.ɪʃ/", meaning: "Phát triển mạnh, thịnh vượng, nở rộ", example: "The business began to flourish after the new marketing campaign.", nextReview: "2026-08-30", level: 0, collectionId: "col2" },
  { id: "cw34", word: "Anticipate", phonetic: "/ænˈtɪs.ɪ.peɪt/", meaning: "Mong đợi, dự đoán trước, dự kiến", example: "We anticipate strong demand for the new product launch.", nextReview: "2026-08-30", level: 0, collectionId: "col2" },
  { id: "cw35", word: "Articulate", phonetic: "/ɑːˈtɪk.jʊ.lət/", meaning: "Diễn đạt rõ ràng, lưu loát, trôi chảy", example: "She was articulate in expressing her ideas during the presentation.", nextReview: "2026-08-30", level: 0, collectionId: "col2" },

  // Business English
  { id: "cw36", word: "Integrity", phonetic: "/ɪnˈteɡ.rɪ.ti/", meaning: "Sự chính trực, liêm chính, đạo đức nghề nghiệp", example: "A leader with integrity earns lasting respect.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=280&fit=crop&auto=format", collectionId: "col3" },
  { id: "cw37", word: "Collaborate", phonetic: "/kəˈlæb.ə.reɪt/", meaning: "Cộng tác, hợp tác cùng nhau", example: "We need to collaborate across departments to solve this.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=280&fit=crop&auto=format", collectionId: "col3" },
  { id: "cw38", word: "Negotiate", phonetic: "/nɪˈɡoʊ.ʃi.eɪt/", meaning: "Đàm phán, thương lượng để đạt thỏa thuận", example: "Both sides agreed to negotiate the terms of the contract.", nextReview: "2026-08-30", level: 0, collectionId: "col3" },
  { id: "cw39", word: "Stakeholder", phonetic: "/ˈsteɪk.hoʊl.dər/", meaning: "Bên liên quan, cổ đông có quyền lợi", example: "The stakeholders reviewed the quarterly performance report.", nextReview: "2026-08-30", level: 0, collectionId: "col3" },
  { id: "cw40", word: "Benchmark", phonetic: "/ˈbentʃ.mɑːrk/", meaning: "Tiêu chuẩn đánh giá, điểm chuẩn tham chiếu", example: "Our company's performance exceeded the industry benchmark.", nextReview: "2026-08-30", level: 0, collectionId: "col3" },
  { id: "cw41", word: "Implement", phonetic: "/ˈɪm.plɪ.ment/", meaning: "Thực thi, triển khai, áp dụng vào thực tế", example: "The team worked hard to implement the new strategy.", nextReview: "2026-08-30", level: 0, collectionId: "col3" },
  { id: "cw42", word: "Entrepreneur", phonetic: "/ˌɒn.trə.prəˈnɜːr/", meaning: "Doanh nhân, người khởi nghiệp", example: "She became a successful entrepreneur at the age of 25.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=280&fit=crop&auto=format", collectionId: "col3" },
  { id: "cw43", word: "Revenue", phonetic: "/ˈrev.ə.njuː/", meaning: "Doanh thu, nguồn thu nhập của doanh nghiệp", example: "The company reported record revenue in the fourth quarter.", nextReview: "2026-08-30", level: 0, collectionId: "col3" },
  { id: "cw44", word: "Strategy", phonetic: "/ˈstræt.ə.dʒi/", meaning: "Chiến lược, kế hoạch tổng thể dài hạn", example: "A clear strategy is essential for business success.", nextReview: "2026-08-30", level: 0, collectionId: "col3" },
  { id: "cw45", word: "Deadline", phonetic: "/ˈded.laɪn/", meaning: "Hạn chót, thời hạn cuối cùng phải hoàn thành", example: "We need to meet the deadline or lose the contract.", nextReview: "2026-08-30", level: 0, collectionId: "col3" },

  // IELTS
  { id: "cw46", word: "Phenomenon", phonetic: "/fɪˈnɒm.ɪ.nən/", meaning: "Hiện tượng, sự kiện đặc biệt đáng chú ý", example: "Climate change is a global phenomenon affecting every continent.", nextReview: "2026-08-30", level: 0, collectionId: "col4" },
  { id: "cw47", word: "Consequently", phonetic: "/ˈkɒn.sɪ.kwənt.li/", meaning: "Do đó, kết quả là, vì vậy", example: "He missed the bus and consequently arrived late for the exam.", nextReview: "2026-08-30", level: 0, collectionId: "col4" },
  { id: "cw48", word: "Furthermore", phonetic: "/ˌfɜː.ðəˈmɔːr/", meaning: "Hơn nữa, thêm vào đó, ngoài ra", example: "Furthermore, the study showed significant improvement in test scores.", nextReview: "2026-08-30", level: 0, collectionId: "col4" },
  { id: "cw49", word: "Substantial", phonetic: "/səbˈstæn.ʃəl/", meaning: "Đáng kể, đáng kể, có tầm quan trọng lớn", example: "There has been a substantial increase in global temperatures.", nextReview: "2026-08-30", level: 0, collectionId: "col4" },
  { id: "cw50", word: "Controversial", phonetic: "/ˌkɒn.trəˈvɜː.ʃəl/", meaning: "Gây tranh cãi, có nhiều ý kiến trái chiều", example: "The government's new policy is highly controversial.", nextReview: "2026-08-30", level: 0, collectionId: "col4" },
  { id: "cw51", word: "Sustainable", phonetic: "/səˈsteɪ.nə.bəl/", meaning: "Bền vững, có thể duy trì lâu dài", example: "We need sustainable solutions to tackle climate change.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=280&fit=crop&auto=format", collectionId: "col4" },
  { id: "cw52", word: "Demonstrate", phonetic: "/ˈdem.ən.streɪt/", meaning: "Chứng minh, minh họa, thể hiện rõ ràng", example: "The experiment demonstrated that the hypothesis was correct.", nextReview: "2026-08-30", level: 0, collectionId: "col4" },
  { id: "cw53", word: "Analyze", phonetic: "/ˈæn.ə.laɪz/", meaning: "Phân tích, nghiên cứu kỹ lưỡng, xem xét", example: "Scientists analyze data to find patterns and draw conclusions.", nextReview: "2026-08-30", level: 0, collectionId: "col4" },
  { id: "cw54", word: "Significant", phonetic: "/sɪɡˈnɪf.ɪ.kənt/", meaning: "Đáng kể, có ý nghĩa quan trọng, nổi bật", example: "There is a significant difference between the two groups.", nextReview: "2026-08-30", level: 0, collectionId: "col4" },
  { id: "cw55", word: "Acknowledge", phonetic: "/əkˈnɒl.ɪdʒ/", meaning: "Thừa nhận, công nhận, xác nhận", example: "It is important to acknowledge your mistakes and learn from them.", nextReview: "2026-08-30", level: 0, collectionId: "col4" },

  // More col1 words (common everyday)
  { id: "cw56", word: "Happy", phonetic: "/ˈhæp.i/", meaning: "Vui vẻ, hạnh phúc, phấn khởi", example: "She felt happy when she received the good news.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },
  { id: "cw57", word: "Angry", phonetic: "/ˈæŋ.ɡri/", meaning: "Tức giận, bực bội, giận dữ", example: "He was angry when he found out his phone was broken.", nextReview: "2026-08-30", level: 0, collectionId: "col1" },
  { id: "cw58", word: "Work", phonetic: "/wɜːk/", meaning: "Làm việc; công việc, việc làm", example: "Hard work and dedication lead to success.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },
  { id: "cw59", word: "Learn", phonetic: "/lɜːn/", meaning: "Học, học hỏi, tiếp thu kiến thức", example: "It's never too late to learn a new language.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },
  { id: "cw60", word: "Travel", phonetic: "/ˈtræv.əl/", meaning: "Du lịch, đi lại, đi đến nơi xa", example: "Traveling broadens your mind and expands your worldview.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },
  { id: "cw61", word: "Dream", phonetic: "/driːm/", meaning: "Giấc mơ; mơ ước, khát vọng", example: "Never stop chasing your dreams, no matter how big they are.", nextReview: "2026-08-30", level: 0, image: "https://images.unsplash.com/photo-1534294668821-28a3054f4256?w=400&h=280&fit=crop&auto=format", collectionId: "col1" },
  { id: "cw62", word: "Hope", phonetic: "/hoʊp/", meaning: "Hy vọng, niềm tin vào tương lai tốt đẹp", example: "Hope is what keeps people going during difficult times.", nextReview: "2026-08-30", level: 0, collectionId: "col1" },
  { id: "cw63", word: "Trust", phonetic: "/trʌst/", meaning: "Tin tưởng, sự tin cậy lẫn nhau", example: "Trust is the foundation of every strong relationship.", nextReview: "2026-08-30", level: 0, collectionId: "col1" },
  { id: "cw64", word: "Change", phonetic: "/tʃeɪndʒ/", meaning: "Thay đổi, sự thay đổi, biến đổi", example: "Change can be scary, but it often leads to growth.", nextReview: "2026-08-30", level: 0, collectionId: "col1" },
  { id: "cw65", word: "Challenge", phonetic: "/ˈtʃæl.ɪndʒ/", meaning: "Thách thức, khó khăn cần vượt qua", example: "Every challenge is an opportunity to grow stronger.", nextReview: "2026-08-30", level: 0, collectionId: "col1" },
  { id: "cw66", word: "Success", phonetic: "/səkˈses/", meaning: "Thành công, kết quả tốt đẹp đạt được", example: "Success is not final; failure is not fatal.", nextReview: "2026-08-30", level: 0, collectionId: "col1" },
  { id: "cw67", word: "Failure", phonetic: "/ˈfeɪ.ljər/", meaning: "Thất bại, sự không đạt được mục tiêu", example: "Failure is the best teacher if you learn from it.", nextReview: "2026-08-30", level: 0, collectionId: "col1" },
  { id: "cw68", word: "Patient", phonetic: "/ˈpeɪ.ʃənt/", meaning: "Kiên nhẫn, bình tĩnh chờ đợi không vội", example: "You need to be patient when learning a new skill.", nextReview: "2026-08-30", level: 0, collectionId: "col1" },
  { id: "cw69", word: "Curious", phonetic: "/ˈkjʊər.i.əs/", meaning: "Tò mò, ham tìm hiểu, muốn biết", example: "Curious people tend to learn faster than others.", nextReview: "2026-08-30", level: 0, collectionId: "col1" },
  { id: "cw70", word: "Brave", phonetic: "/breɪv/", meaning: "Dũng cảm, can đảm, không sợ hãi", example: "It takes a brave person to admit they were wrong.", nextReview: "2026-08-30", level: 0, collectionId: "col1" },
  { id: "cw71", word: "Grateful", phonetic: "/ˈɡreɪt.fəl/", meaning: "Biết ơn, cảm kích sự giúp đỡ của người khác", example: "She was grateful for all the support she received.", nextReview: "2026-08-30", level: 0, collectionId: "col1" },
  { id: "cw72", word: "Inspire", phonetic: "/ɪnˈspaɪər/", meaning: "Truyền cảm hứng, khơi dậy sự sáng tạo", example: "Great teachers inspire their students to reach their potential.", nextReview: "2026-08-30", level: 0, collectionId: "col1" },
  { id: "cw73", word: "Respect", phonetic: "/rɪˈspekt/", meaning: "Tôn trọng, kính trọng, coi trọng người khác", example: "Mutual respect is the key to any healthy relationship.", nextReview: "2026-08-30", level: 0, collectionId: "col1" },
  { id: "cw74", word: "Communicate", phonetic: "/kəˈmjuː.nɪ.keɪt/", meaning: "Giao tiếp, truyền đạt, liên lạc", example: "It's important to communicate clearly in the workplace.", nextReview: "2026-08-30", level: 0, collectionId: "col1" },
  { id: "cw75", word: "Achieve", phonetic: "/əˈtʃiːv/", meaning: "Đạt được, hoàn thành, chinh phục mục tiêu", example: "With enough effort, you can achieve anything you set your mind to.", nextReview: "2026-08-30", level: 0, collectionId: "col1" },

  // More col2
  { id: "cw76", word: "Empathy", phonetic: "/ˈem.pə.θi/", meaning: "Sự đồng cảm, khả năng hiểu cảm xúc người khác", example: "Empathy allows us to connect deeply with other people.", nextReview: "2026-08-30", level: 0, collectionId: "col2" },
  { id: "cw77", word: "Compassion", phonetic: "/kəmˈpæʃ.ən/", meaning: "Lòng trắc ẩn, sự cảm thông và muốn giúp đỡ", example: "Compassion for others makes the world a better place.", nextReview: "2026-08-30", level: 0, collectionId: "col2" },
  { id: "cw78", word: "Versatile", phonetic: "/ˈvɜː.sə.taɪl/", meaning: "Đa năng, linh hoạt, có nhiều khả năng", example: "A versatile employee can handle many different tasks.", nextReview: "2026-08-30", level: 0, collectionId: "col2" },
  { id: "cw79", word: "Diligent", phonetic: "/ˈdɪl.ɪ.dʒənt/", meaning: "Chăm chỉ, cần cù, siêng năng làm việc", example: "Diligent students always get the best results.", nextReview: "2026-08-30", level: 0, collectionId: "col2" },
  { id: "cw80", word: "Inevitable", phonetic: "/ɪnˈev.ɪ.tə.bəl/", meaning: "Không thể tránh khỏi, tất yếu phải xảy ra", example: "Change is inevitable in a rapidly evolving world.", nextReview: "2026-08-30", level: 0, collectionId: "col2" },
];
