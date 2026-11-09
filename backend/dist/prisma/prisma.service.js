var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('file:')) {
    process.env.DATABASE_URL = 'file:./dev.db';
}
const CURATED_COMMUNICATION_SETS = [
    {
        name: 'Giao Tiếp Thông Dụng (Core Conversational)',
        description: 'Những từ vựng quan trọng nhất để tự tin bắt chuyện, phản xạ và giao tiếp hàng ngày.',
        thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&q=80',
        words: [
            { word: 'available', phonetic: '/əˈveɪləbl/', translation: 'có sẵn, rảnh rỗi', definition: 'Are you available for a quick call this afternoon? (Chiều nay bạn có rảnh gọi điện nhanh không?)' },
            { word: 'recommend', phonetic: '/ˌrekəˈmend/', translation: 'gợi ý, giới thiệu', definition: 'Could you recommend a good local restaurant nearby? (Bạn có thể gợi ý một nhà hàng địa phương ngon gần đây không?)' },
            { word: 'appreciate', phonetic: '/əˈpriːʃieɪt/', translation: 'trân trọng, cảm kích', definition: 'I really appreciate your help with this project. (Tôi thực sự cảm kích sự giúp đỡ của bạn với dự án này.)' },
            { word: 'definitely', phonetic: '/ˈdefɪnətli/', translation: 'chắc chắn rồi', definition: 'I will definitely join you guys for dinner tonight! (Chắc chắn tối nay tôi sẽ đi ăn tối cùng mọi người!)' },
            { word: 'actually', phonetic: '/ˈæktʃuəli/', translation: 'thực ra là', definition: 'Actually, I have lived in Ho Chi Minh City for five years. (Thực ra tôi đã sống ở TP.HCM được 5 năm rồi.)' },
            { word: 'convenient', phonetic: '/kənˈviːniənt/', translation: 'thuận tiện, tiện lợi', definition: 'What time would be most convenient for you? (Mấy giờ thì thuận tiện nhất cho bạn?)' },
            { word: 'experience', phonetic: '/ɪkˈspɪəriəns/', translation: 'kinh nghiệm, trải nghiệm', definition: 'Traveling alone was an unforgettable experience for me. (Đi du lịch một mình là một trải nghiệm khó quên đối với tôi.)' },
            { word: 'opportunity', phonetic: '/ˌɒpəˈtjuːnəti/', translation: 'cơ hội', definition: 'Thank you for giving me the opportunity to interview today. (Cảm ơn vì đã cho tôi cơ hội phỏng vấn hôm nay.)' },
            { word: 'schedule', phonetic: '/ˈʃedjuːl/', translation: 'lịch trình, sắp xếp lịch', definition: 'Let me check my schedule and get back to you soon. (Để tôi kiểm tra lại lịch trình rồi báo lại bạn sớm nhé.)' },
            { word: 'impression', phonetic: '/ɪmˈpreʃn/', translation: 'ấn tượng', definition: 'She made a great first impression on the whole team. (Cô ấy đã tạo ấn tượng đầu tiên rất tốt với cả nhóm.)' },
            { word: 'confident', phonetic: '/ˈkɒnfɪdənt/', translation: 'tự tin', definition: 'Practice speaking every day so you can feel more confident. (Hãy luyện nói mỗi ngày để bạn cảm thấy tự tin hơn.)' },
            { word: 'exhausted', phonetic: '/ɪɡˈzɔːstɪd/', translation: 'kiệt sức, mệt nhoài', definition: 'I am completely exhausted after a long day at work. (Tôi hoàn toàn kiệt sức sau một ngày dài làm việc.)' },
            { word: 'flexible', phonetic: '/ˈfleksəbl/', translation: 'linh hoạt', definition: 'My working hours are quite flexible this week. (Giờ làm việc của tôi tuần này khá linh hoạt.)' },
            { word: 'suggestion', phonetic: '/səˈdʒestʃən/', translation: 'đề xuất, gợi ý', definition: 'Do you have any suggestions for our weekend trip? (Bạn có gợi ý nào cho chuyến đi cuối tuần của chúng ta không?)' },
            { word: 'misunderstand', phonetic: '/ˌmɪsʌndəˈstænd/', translation: 'hiểu lầm', definition: 'Don’t misunderstand me, I think your idea is great. (Đừng hiểu lầm tôi, tôi nghĩ ý tưởng của bạn rất tuyệt.)' },
            { word: 'hang out', phonetic: '/hæŋ aʊt/', translation: 'đi chơi, tụ tập bạn bè', definition: 'Where do you usually hang out with your friends on weekends? (Cuối tuần bạn thường đi chơi ở đâu với bạn bè?)' },
            { word: 'catch up', phonetic: '/kætʃ ʌp/', translation: 'hàn huyên, cập nhật tình hình', definition: 'Let’s grab a coffee and catch up sometime this week! (Tuần này đi cà phê hàn huyên nhé!)' },
            { word: 'figure out', phonetic: '/ˈfɪɡər aʊt/', translation: 'tìm ra cách giải quyết, hiểu ra', definition: 'We need to figure out how to solve this problem quickly. (Chúng ta cần tìm ra cách giải quyết vấn đề này nhanh chóng.)' },
            { word: 'look forward to', phonetic: '/lʊk ˈfɔːwəd tuː/', translation: 'mong đợi, hào hứng chờ đón', definition: 'I really look forward to meeting you in person. (Tôi rất mong được gặp trực tiếp bạn.)' },
            { word: 'make sense', phonetic: '/meɪk sens/', translation: 'hợp lý, dễ hiểu', definition: 'Does that make sense to you, or should I explain again? (Điều đó có dễ hiểu với bạn không, hay để tôi giải thích lại?)' }
        ],
    },
    {
        name: 'Tiếng Anh Công Sở & Phỏng Vấn (Business & Work)',
        description: 'Từ vựng cốt lõi để họp hành, viết email, thuyết trình và trả lời phỏng vấn chuyên nghiệp.',
        thumbnail: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=500&q=80',
        words: [
            { word: 'deadline', phonetic: '/ˈdedlaɪn/', translation: 'hạn chót', definition: 'We need to submit the final report before Friday’s deadline. (Chúng ta cần nộp báo cáo cuối cùng trước hạn chót thứ Sáu.)' },
            { word: 'collaborate', phonetic: '/kəˈlæbəreɪt/', translation: 'hợp tác, phối hợp', definition: 'Our marketing team will collaborate closely with the design department. (Đội marketing sẽ phối hợp chặt chẽ với bộ phận thiết kế.)' },
            { word: 'negotiate', phonetic: '/nɪˈɡəʊʃieɪt/', translation: 'đàm phán, thương lượng', definition: 'We managed to negotiate a better contract with the supplier. (Chúng tôi đã đàm phán được một hợp đồng tốt hơn với nhà cung cấp.)' },
            { word: 'priority', phonetic: '/praɪˈɒrəti/', translation: 'ưu tiên hàng đầu', definition: 'Customer satisfaction is always our top priority. (Sự hài lòng của khách hàng luôn là ưu tiên hàng đầu của chúng tôi.)' },
            { word: 'feedback', phonetic: '/ˈfiːdbæk/', translation: 'phản hồi, góp ý', definition: 'Could you give me some feedback on my presentation slides? (Bạn có thể góp ý cho slide thuyết trình của tôi được không?)' },
            { word: 'objective', phonetic: '/əbˈdʒektɪv/', translation: 'mục tiêu', definition: 'Our main objective this quarter is to increase user retention. (Mục tiêu chính quý này là tăng tỷ lệ giữ chân người dùng.)' },
            { word: 'postpone', phonetic: '/pəˈspəʊn/', translation: 'hoãn lại, dời lịch', definition: 'Can we postpone our meeting until tomorrow morning? (Chúng ta có thể dời cuộc họp sang sáng mai được không?)' },
            { word: 'confirm', phonetic: '/kənˈfɜːm/', translation: 'xác nhận', definition: 'Please send an email to confirm your attendance. (Vui lòng gửi email để xác nhận sự tham dự của bạn.)' },
            { word: 'agenda', phonetic: '/əˈdʒendə/', translation: 'nội dung cuộc họp', definition: 'There are three important items on today’s meeting agenda. (Có 3 mục quan trọng trong chương trình họp hôm nay.)' },
            { word: 'productive', phonetic: '/prəˈdʌktɪv/', translation: 'hiệu quả, năng suất', definition: 'Thank you everyone for a very productive discussion today. (Cảm ơn mọi người vì buổi thảo luận rất hiệu quả hôm nay.)' },
            { word: 'strategy', phonetic: '/ˈstrætədʒi/', translation: 'chiến lược', definition: 'We are developing a new growth strategy for the Asian market. (Chúng tôi đang phát triển chiến lược tăng trưởng mới cho thị trường châu Á.)' },
            { word: 'budget', phonetic: '/ˈbʌdʒɪt/', translation: 'ngân sách', definition: 'The project was completed on time and under budget. (Dự án đã hoàn thành đúng hạn và trong ngân sách.)' },
            { word: 'promote', phonetic: '/prəˈməʊt/', translation: 'thăng chức / quảng bá', definition: 'She was promoted to Senior Project Manager last month. (Cô ấy đã được thăng chức lên Quản lý Dự án Cấp cao tháng trước.)' },
            { word: 'candidate', phonetic: '/ˈkændɪdət/', translation: 'ứng viên', definition: 'He is the strongest candidate for the software engineer position. (Anh ấy là ứng viên sáng giá nhất cho vị trí kỹ sư phần mềm.)' },
            { word: 'follow up', phonetic: '/ˈfɒləʊ ʌp/', translation: 'theo sát, phản hồi tiếp nối', definition: 'I am writing to follow up on our conversation yesterday. (Tôi viết thư này để tiếp nối cuộc trao đổi của chúng ta hôm qua.)' },
            { word: 'touch base', phonetic: '/tʌtʃ beɪs/', translation: 'liên lạc nhanh để cập nhật', definition: 'Let’s touch base next Monday to check on the progress. (Thứ Hai tới chúng ta trao đổi nhanh để kiểm tra tiến độ nhé.)' }
        ],
    },
    {
        name: 'Du Lịch, Sân Bay & Nhà Hàng (Travel & Dining)',
        description: 'Trọn bộ từ vựng sinh tồn khi đi du lịch nước ngoài, làm thủ tục sân bay, khách sạn và gọi món.',
        thumbnail: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&q=80',
        words: [
            { word: 'reservation', phonetic: '/ˌrezəˈveɪʃn/', translation: 'sự đặt chỗ trước (bàn/phòng)', definition: 'Hello, I have a hotel reservation under the name Tran. (Xin chào, tôi có đặt phòng trước dưới tên Trần.)' },
            { word: 'boarding pass', phonetic: '/ˈbɔːdɪŋ pɑːs/', translation: 'thẻ lên máy bay', definition: 'May I see your passport and boarding pass, please? (Cho tôi xem hộ chiếu và thẻ lên máy bay của bạn nhé?)' },
            { word: 'itinerary', phonetic: '/aɪˈtɪnərəri/', translation: 'lịch trình chuyến đi', definition: 'I will send you our full travel itinerary tonight. (Tối nay tôi sẽ gửi cho bạn toàn bộ lịch trình chuyến đi.)' },
            { word: 'luggage', phonetic: '/ˈlʌɡɪdʒ/', translation: 'hành lý', definition: 'Where can I claim my checked luggage? (Tôi có thể nhận hành lý ký gửi ở đâu?)' },
            { word: 'souvenir', phonetic: '/ˌsuːvəˈnɪə(r)/', translation: 'quà lưu niệm', definition: 'I bought some handmade souvenirs for my family. (Tôi đã mua vài món quà lưu niệm thủ công cho gia đình.)' },
            { word: 'destination', phonetic: '/ˌdestɪˈneɪʃn/', translation: 'điểm đến', definition: 'Da Nang is a very popular tourist destination in Vietnam. (Đà Nẵng là một điểm đến du lịch rất nổi tiếng ở Việt Nam.)' },
            { word: 'accommodation', phonetic: '/əˌkɒməˈdeɪʃn/', translation: 'chỗ ở (khách sạn, homestay)', definition: 'Have you booked your accommodation in Tokyo yet? (Bạn đã đặt chỗ ở tại Tokyo chưa?)' },
            { word: 'specialty', phonetic: '/ˈspeʃəlti/', translation: 'món đặc sản', definition: 'What is the local specialty of this restaurant? (Món đặc sản của nhà hàng này là gì vậy?)' },
            { word: 'allergic', phonetic: '/əˈlɜːdʒɪk/', translation: 'bị dị ứng', definition: 'Does this dish contain peanuts? I am allergic to nuts. (Món này có đậu phộng không? Tôi bị dị ứng với các loại hạt.)' },
            { word: 'appetizer', phonetic: '/ˈæpɪtaɪzə(r)/', translation: 'món khai vị', definition: 'Would you like to order any appetizers before the main course? (Bạn có muốn gọi món khai vị trước món chính không?)' },
            { word: 'complimentary', phonetic: '/ˌkɒmplɪˈmentri/', translation: 'miễn phí (đi kèm dịch vụ)', definition: 'The hotel offers complimentary breakfast every morning. (Khách sạn phục vụ bữa sáng miễn phí mỗi sáng.)' },
            { word: 'currency', phonetic: '/ˈkʌrənsi/', translation: 'tiền tệ', definition: 'Where is the best place to exchange foreign currency? (Đổi ngoại tệ ở đâu là tốt nhất nhỉ?)' }
        ],
    },
];
let PrismaService = class PrismaService extends PrismaClient {
    constructor() {
        super({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL?.startsWith('file:') ? process.env.DATABASE_URL : 'file:./dev.db',
                },
            },
        });
    }
    async onModuleInit() {
        await this.$connect();
        await this.ensureSeeded();
    }
    async ensureSeeded() {
        try {
            const adminExists = await this.user.findUnique({ where: { username: 'admin' } });
            if (!adminExists) {
                const hashedPassword = await bcrypt.hash('123456', 10);
                await this.user.create({
                    data: {
                        username: 'admin',
                        password: hashedPassword,
                        name: 'Administrator (Full Access)',
                        role: 'ADMIN',
                    },
                });
            }
            const luanExists = await this.user.findUnique({ where: { username: 'luantpm98' } });
            if (!luanExists) {
                const hashedPassword = await bcrypt.hash('123456', 10);
                await this.user.create({
                    data: {
                        username: 'luantpm98',
                        password: hashedPassword,
                        name: 'Trần Luân (Admin)',
                        role: 'ADMIN',
                    },
                });
            }
            for (const cSet of CURATED_COMMUNICATION_SETS) {
                const existing = await this.vocabularySet.findUnique({ where: { name: cSet.name } });
                if (!existing) {
                    const createdSet = await this.vocabularySet.create({
                        data: {
                            name: cSet.name,
                            description: cSet.description,
                            thumbnail: cSet.thumbnail,
                        },
                    });
                    await this.vocabulary.createMany({
                        data: cSet.words.map((w) => ({
                            word: w.word,
                            phonetic: w.phonetic,
                            translation: w.translation,
                            definition: w.definition,
                            setId: createdSet.id,
                        })),
                    });
                }
            }
            const ox1000 = await this.vocabularySet.findUnique({ where: { name: 'Oxford 1000' } });
            if (!ox1000) {
                const set1000 = await this.vocabularySet.create({
                    data: {
                        name: 'Oxford 1000',
                        description: '1000 từ vựng tiếng Anh thông dụng nhất theo chuẩn Oxford CEFR A1-B1.',
                        thumbnail: 'https://images.unsplash.com/photo-1546410531-b4c6e91f6308?w=400&q=80',
                    },
                });
                const set3000 = await this.vocabularySet.create({
                    data: {
                        name: 'Oxford 3000',
                        description: 'Bộ từ vựng mở rộng giúp đọc hiểu và giao tiếp thành thạo B2-C1.',
                        thumbnail: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80',
                    },
                });
                const wordsFile = path.join(process.cwd(), 'words.txt');
                if (fs.existsSync(wordsFile)) {
                    const text = fs.readFileSync(wordsFile, 'utf-8');
                    const allWords = text.split('\n').map((w) => w.trim()).filter((w) => w.length > 0);
                    const words1000 = allWords.slice(0, 1000);
                    const words3000 = allWords.slice(1000, 3000);
                    const mapToData = (wordList, setId) => wordList.map((word) => ({
                        word,
                        definition: `We often use "${word}" in daily English communication.`,
                        phonetic: `/${word}/`,
                        imageUrl: 'https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?w=400&q=80',
                        setId,
                    }));
                    const chunkSize = 250;
                    for (let i = 0; i < words1000.length; i += chunkSize) {
                        await this.vocabulary.createMany({
                            data: mapToData(words1000.slice(i, i + chunkSize), set1000.id),
                        });
                    }
                    for (let i = 0; i < words3000.length; i += chunkSize) {
                        await this.vocabulary.createMany({
                            data: mapToData(words3000.slice(i, i + chunkSize), set3000.id),
                        });
                    }
                }
            }
        }
        catch (e) {
            console.warn('Auto-seed check warning:', e.message);
        }
    }
};
PrismaService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], PrismaService);
export { PrismaService };
//# sourceMappingURL=prisma.service.js.map