import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDatabase } from "../config/db.js";

dotenv.config();

import HealthCheck from "../models/HealthCheck.js";
import Question from "../models/Question.js";
import AnswerOption from "../models/AnswerOption.js";
import HealthCheckResult from "../models/HealthCheckResult.js";

const healthChecksData = [
  {
    name: "Bài kiểm tra trí nhớ và mức độ tập trung chú ý",
    slug: "tri-nho-va-tap-trung",
    description: "Đánh giá khả năng ghi nhớ và tập trung của bạn",
    shortDescription: "Kiểm tra nhanh khả năng ghi nhớ và tập trung để phát hiện sớm các vấn đề về nhận thức",
    sortOrder: 1,
    questions: [
      {
        questionText: "Bạn có thường xuyên quên những việc mới xảy ra như quên chỗ để đồ vật, quên tên người mới được giới thiệu, hoặc hỏi lặp lại nhiều lần một vấn đề không?",
        order: 1,
        options: [
          { optionText: "Có, nhiều", scoreValue: 3 },
          { optionText: "Có, nhưng mức độ không nhiều", scoreValue: 1 },
          { optionText: "Không", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có gặp khó khăn trong việc nhớ lại các sự kiện quan trọng hoặc thông tin quan trọng không?",
        order: 2,
        options: [
          { optionText: "Thường xuyên", scoreValue: 3 },
          { optionText: "Thỉnh thoảng", scoreValue: 1 },
          { optionText: "Hiếm khi", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có cảm thấy khó tập trung vào công việc hoặc các hoạt động hàng ngày không?",
        order: 3,
        options: [
          { optionText: "Rất khó", scoreValue: 3 },
          { optionText: "Khó một chút", scoreValue: 1 },
          { optionText: "Không khó", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có cảm thấy khó khăn trong việc làm theo hướng dẫn hoặc hoàn thành nhiệm vụ phức tạp không?",
        order: 4,
        options: [
          { optionText: "Rất khó", scoreValue: 3 },
          { optionText: "Khó một chút", scoreValue: 1 },
          { optionText: "Không khó", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có cảm thấy hay bị lạc đường hoặc quên đường đi ở những nơi quen thuộc không?",
        order: 5,
        options: [
          { optionText: "Thường xuyên", scoreValue: 3 },
          { optionText: "Thỉnh thoảng", scoreValue: 1 },
          { optionText: "Hiếm khi hoặc không bao giờ", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có cảm thấy khó khăn trong việc tìm từ ngữ phù hợp khi nói chuyện không?",
        order: 6,
        options: [
          { optionText: "Thường xuyên", scoreValue: 3 },
          { optionText: "Thỉnh thoảng", scoreValue: 1 },
          { optionText: "Hiếm khi", scoreValue: 0 }
        ]
      }
    ],
    results: [
      {
        minScore: 0,
        maxScore: 3,
        title: "Nguy cơ thấp",
        description: "Khả năng ghi nhớ và tập trung của bạn có vẻ tốt. Tuy nhiên, hãy tiếp tục duy trì lối sống lành mạnh để cải thiện và bảo vệ sức khỏe não bộ.",
        severity: "low",
        recommendations: [
          "Duy trì chế độ ăn uống cân bằng với nhiều rau xanh và trái cây",
          "Tập thể dục thường xuyên, ít nhất 30 phút mỗi ngày",
          "Ngủ đủ giấc, từ 7-9 giờ mỗi đêm",
          "Tham gia các hoạt động kích thích trí não như đọc sách, chơi cờ, học ngôn ngữ mới"
        ]
      },
      {
        minScore: 4,
        maxScore: 9,
        title: "Nguy cơ trung bình",
        description: "Bạn có một số dấu hiệu nhẹ về vấn đề trí nhớ và tập trung. Hãy chú ý đến các triệu chứng và xem xét thay đổi lối sống để cải thiện.",
        severity: "medium",
        recommendations: [
          "Tăng cường các hoạt động rèn luyện trí não",
          "Giảm căng thẳng và lo âu",
          "Tham khảo ý kiến bác sĩ nếu các triệu chứng tiếp tục",
          "Duy trì lối sống lành mạnh với chế độ ăn uống và tập thể dục đều đặn"
        ]
      },
      {
        minScore: 10,
        maxScore: 18,
        title: "Nguy cơ cao",
        description: "Bạn có nhiều dấu hiệu về vấn đề trí nhớ và tập trung. Nên đến cơ sở y tế chuyên khoa để được đánh giá và tư vấn chi tiết hơn.",
        severity: "high",
        recommendations: [
          "Đến bác sĩ chuyên khoa thần kinh để được kiểm tra và đánh giá chi tiết",
          "Thực hiện các bài kiểm tra nhận thức chuyên sâu",
          "Tuân thủ các phương pháp điều trị và lời khuyên của bác sĩ",
          "Có người thân đi cùng khi thăm khám để cung cấp thông tin bổ sung"
        ]
      }
    ]
  },
  {
    name: "Bài kiểm tra sàng lọc nguy cơ tiền đái tháo đường",
    slug: "tien-dai-thao-duong",
    description: "Đánh giá nguy cơ mắc tiền đái tháo đường",
    shortDescription: "Kiểm tra nguy cơ tiền đái tháo đường dựa trên các yếu tố lối sống và triệu chứng",
    sortOrder: 2,
    questions: [
      {
        questionText: "Bạn có tiền sử gia đình mắc bệnh đái tháo đường không?",
        order: 1,
        options: [
          { optionText: "Có, bố hoặc mẹ", scoreValue: 2 },
          { optionText: "Có, anh chị em", scoreValue: 1 },
          { optionText: "Không", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có thừa cân hoặc béo phì không? (BMI > 25)",
        order: 2,
        options: [
          { optionText: "Có, béo phì (BMI > 30)", scoreValue: 3 },
          { optionText: "Có, thừa cân (BMI 25-30)", scoreValue: 2 },
          { optionText: "Không", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có tập thể dục ít hơn 3 lần/tuần không?",
        order: 3,
        options: [
          { optionText: "Có, rất ít hoặc không tập", scoreValue: 2 },
          { optionText: "Có, nhưng thỉnh thoảng tập", scoreValue: 1 },
          { optionText: "Không, tập đều đặn", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có thường xuyên cảm thấy khát nước và đi tiểu nhiều không?",
        order: 4,
        options: [
          { optionText: "Thường xuyên", scoreValue: 3 },
          { optionText: "Thỉnh thoảng", scoreValue: 1 },
          { optionText: "Hiếm khi", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có cảm thấy mệt mỏi hoặc mất năng lượng thường xuyên không?",
        order: 5,
        options: [
          { optionText: "Thường xuyên", scoreValue: 2 },
          { optionText: "Thỉnh thoảng", scoreValue: 1 },
          { optionText: "Hiếm khi", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có tuổi trên 45 không?",
        order: 6,
        options: [
          { optionText: "Trên 45 tuổi", scoreValue: 2 },
          { optionText: "35-45 tuổi", scoreValue: 1 },
          { optionText: "Dưới 35 tuổi", scoreValue: 0 }
        ]
      }
    ],
    results: [
      {
        minScore: 0,
        maxScore: 4,
        title: "Nguy cơ thấp",
        description: "Nguy cơ tiền đái tháo đường của bạn hiện tại thấp. Hãy tiếp tục duy trì lối sống lành mạnh.",
        severity: "low",
        recommendations: [
          "Duy trì chế độ ăn uống cân bằng, ít đường và tinh bột",
          "Tập thể dục ít nhất 30 phút mỗi ngày",
          "Duy trì cân nặng hợp lý",
          "Kiểm tra đường huyết định kỳ"
        ]
      },
      {
        minScore: 5,
        maxScore: 9,
        title: "Nguy cơ trung bình",
        description: "Bạn có một số yếu tố nguy cơ tiền đái tháo đường. Nên thay đổi lối sống và kiểm tra sức khỏe định kỳ.",
        severity: "medium",
        recommendations: [
          "Giảm cân nếu thừa cân",
          "Tăng cường hoạt động thể chất",
          "Giảm lượng đường và tinh bột trong khẩu phần ăn",
          "Đến bác sĩ để kiểm tra đường huyết và HbA1c"
        ]
      },
      {
        minScore: 10,
        maxScore: 15,
        title: "Nguy cơ cao",
        description: "Bạn có nhiều yếu tố nguy cơ tiền đái tháo đường. Nên đến cơ sở y tế để được kiểm tra và tư vấn kịp thời.",
        severity: "high",
        recommendations: [
          "Đến bác sĩ nội tiết để được kiểm tra đường huyết và HbA1c",
          "Thực hiện xét nghiệm dung nạp glucose nếu cần",
          "Bắt đầu chế độ ăn kiêng và tập luyện theo hướng dẫn của bác sĩ",
          "Theo dõi đường huyết thường xuyên"
        ]
      }
    ]
  },
  {
    name: "Bài kiểm tra khả năng suy giáp",
    slug: "suy-giap",
    description: "Đánh giá nguy cơ suy giáp",
    shortDescription: "Kiểm tra các triệu chứng để đánh giá nguy cơ suy giáp",
    sortOrder: 3,
    questions: [
      {
        questionText: "Bạn có cảm thấy mệt mỏi và thiếu năng lượng thường xuyên không?",
        order: 1,
        options: [
          { optionText: "Rất thường xuyên", scoreValue: 3 },
          { optionText: "Thỉnh thoảng", scoreValue: 1 },
          { optionText: "Hiếm khi", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có tăng cân không rõ nguyên nhân không?",
        order: 2,
        options: [
          { optionText: "Có, tăng nhiều", scoreValue: 3 },
          { optionText: "Có, tăng nhẹ", scoreValue: 1 },
          { optionText: "Không", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có cảm thấy lạnh hơn bình thường không?",
        order: 3,
        options: [
          { optionText: "Thường xuyên", scoreValue: 2 },
          { optionText: "Thỉnh thoảng", scoreValue: 1 },
          { optionText: "Hiếm khi", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có gặp vấn đề về da khô, tóc rụng, hoặc móng tay dễ gãy không?",
        order: 4,
        options: [
          { optionText: "Có nhiều triệu chứng", scoreValue: 3 },
          { optionText: "Có một vài triệu chứng", scoreValue: 1 },
          { optionText: "Không", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có cảm thấy trầm cảm, lo âu hoặc khó tập trung không?",
        order: 5,
        options: [
          { optionText: "Thường xuyên", scoreValue: 2 },
          { optionText: "Thỉnh thoảng", scoreValue: 1 },
          { optionText: "Hiếm khi", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có tiền sử phẫu thuật tuyến giáp hoặc điều trị bằng i-ốt phóng xạ không?",
        order: 6,
        options: [
          { optionText: "Có", scoreValue: 3 },
          { optionText: "Không", scoreValue: 0 }
        ]
      }
    ],
    results: [
      {
        minScore: 0,
        maxScore: 4,
        title: "Nguy cơ thấp",
        description: "Nguy cơ suy giáp của bạn hiện tại thấp. Hãy tiếp tục theo dõi sức khỏe.",
        severity: "low",
        recommendations: [
          "Duy trì chế độ ăn uống đủ i-ốt",
          "Tập thể dục thường xuyên",
          "Theo dõi các triệu chứng nếu có thay đổi"
        ]
      },
      {
        minScore: 5,
        maxScore: 9,
        title: "Nguy cơ trung bình",
        description: "Bạn có một số triệu chứng có thể liên quan đến suy giáp. Nên đến bác sĩ để được kiểm tra.",
        severity: "medium",
        recommendations: [
          "Đến bác sĩ nội tiết để được kiểm tra",
          "Xét nghiệm TSH, T3, T4",
          "Theo dõi các triệu chứng",
          "Thay đổi chế độ ăn uống và lối sống"
        ]
      },
      {
        minScore: 10,
        maxScore: 16,
        title: "Nguy cơ cao",
        description: "Bạn có nhiều triệu chứng nghi ngờ suy giáp. Nên đến cơ sở y tế ngay để được kiểm tra và điều trị kịp thời.",
        severity: "high",
        recommendations: [
          "Đến bác sĩ nội tiết ngay để được đánh giá",
          "Xét nghiệm đầy đủ: TSH, T3, T4, kháng thể kháng tuyến giáp",
          "Tuân thủ điều trị theo chỉ định của bác sĩ",
          "Theo dõi định kỳ và điều chỉnh liều thuốc nếu cần"
        ]
      }
    ]
  },
  {
    name: "Đánh giá mức độ kiểm soát bệnh hen",
    slug: "kiem-soat-benh-hen",
    description: "Đánh giá mức độ kiểm soát bệnh hen suyễn",
    shortDescription: "Kiểm tra mức độ kiểm soát bệnh hen để điều chỉnh kế hoạch điều trị phù hợp",
    sortOrder: 4,
    questions: [
      {
        questionText: "Trong 4 tuần qua, bạn có bị các triệu chứng hen như ho, khò khè, khó thở vào ban ngày không?",
        order: 1,
        options: [
          { optionText: "Hơn 2 lần/tuần", scoreValue: 3 },
          { optionText: "1-2 lần/tuần", scoreValue: 2 },
          { optionText: "Ít hơn 1 lần/tuần", scoreValue: 1 },
          { optionText: "Không có", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có thức giấc vì hen vào ban đêm không?",
        order: 2,
        options: [
          { optionText: "Hơn 1 lần/tuần", scoreValue: 3 },
          { optionText: "1 lần/tuần", scoreValue: 2 },
          { optionText: "1-2 lần/tháng", scoreValue: 1 },
          { optionText: "Không bao giờ", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có cần sử dụng thuốc cắt cơn (bình xịt) bao nhiêu lần/tuần?",
        order: 3,
        options: [
          { optionText: "Hơn 2 lần/tuần", scoreValue: 3 },
          { optionText: "1-2 lần/tuần", scoreValue: 2 },
          { optionText: "Ít hơn 1 lần/tuần", scoreValue: 1 },
          { optionText: "Không cần", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bệnh hen có ảnh hưởng đến các hoạt động hàng ngày của bạn không?",
        order: 4,
        options: [
          { optionText: "Rất nhiều", scoreValue: 3 },
          { optionText: "Một phần", scoreValue: 2 },
          { optionText: "Ít", scoreValue: 1 },
          { optionText: "Không", scoreValue: 0 }
        ]
      }
    ],
    results: [
      {
        minScore: 0,
        maxScore: 3,
        title: "Kiểm soát tốt",
        description: "Bệnh hen của bạn đang được kiểm soát tốt. Hãy tiếp tục tuân thủ điều trị và theo dõi định kỳ.",
        severity: "low",
        recommendations: [
          "Tiếp tục sử dụng thuốc theo chỉ định của bác sĩ",
          "Tránh các yếu tố kích thích hen như khói thuốc, bụi, phấn hoa",
          "Tập thể dục đều đặn và có kế hoạch",
          "Theo dõi định kỳ với bác sĩ"
        ]
      },
      {
        minScore: 4,
        maxScore: 8,
        title: "Kiểm soát một phần",
        description: "Bệnh hen của bạn đang được kiểm soát một phần. Cần điều chỉnh kế hoạch điều trị.",
        severity: "medium",
        recommendations: [
          "Đến bác sĩ để đánh giá lại kế hoạch điều trị",
          "Có thể cần tăng liều thuốc kiểm soát",
          "Tuân thủ nghiêm ngặt việc sử dụng thuốc",
          "Theo dõi các triệu chứng và ghi chép lại"
        ]
      },
      {
        minScore: 9,
        maxScore: 12,
        title: "Kiểm soát kém",
        description: "Bệnh hen của bạn chưa được kiểm soát tốt. Cần đến bác sĩ ngay để được điều chỉnh điều trị.",
        severity: "high",
        recommendations: [
          "Đến bác sĩ ngay để được đánh giá và điều chỉnh điều trị",
          "Có thể cần tăng liều thuốc hoặc thay đổi loại thuốc",
          "Kiểm tra kỹ thuật sử dụng bình xịt",
          "Tránh các yếu tố kích thích hen",
          "Có kế hoạch hành động khẩn cấp khi lên cơn hen"
        ]
      }
    ]
  },
  {
    name: "Bài kiểm tra nguy cơ mắc bệnh tim mạch",
    slug: "benh-tim-mach",
    description: "Đánh giá nguy cơ mắc các bệnh tim mạch",
    shortDescription: "Kiểm tra nguy cơ mắc bệnh tim mạch dựa trên các yếu tố nguy cơ",
    sortOrder: 5,
    questions: [
      {
        questionText: "Bạn có tiền sử gia đình mắc bệnh tim mạch không?",
        order: 1,
        options: [
          { optionText: "Có, bố hoặc mẹ trước 55 tuổi", scoreValue: 3 },
          { optionText: "Có, bố hoặc mẹ sau 55 tuổi", scoreValue: 2 },
          { optionText: "Có, anh chị em", scoreValue: 1 },
          { optionText: "Không", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có hút thuốc lá không?",
        order: 2,
        options: [
          { optionText: "Có, hút nhiều", scoreValue: 3 },
          { optionText: "Có, hút ít", scoreValue: 2 },
          { optionText: "Đã bỏ thuốc", scoreValue: 1 },
          { optionText: "Chưa bao giờ hút", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có thường xuyên tập thể dục không?",
        order: 3,
        options: [
          { optionText: "Không tập hoặc rất ít", scoreValue: 3 },
          { optionText: "Tập không đều", scoreValue: 2 },
          { optionText: "Tập đều đặn", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có bị cao huyết áp không?",
        order: 4,
        options: [
          { optionText: "Có, không kiểm soát tốt", scoreValue: 3 },
          { optionText: "Có, đang điều trị", scoreValue: 2 },
          { optionText: "Không biết", scoreValue: 1 },
          { optionText: "Không", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có bị tiểu đường hoặc tiền tiểu đường không?",
        order: 5,
        options: [
          { optionText: "Có, tiểu đường", scoreValue: 3 },
          { optionText: "Có, tiền tiểu đường", scoreValue: 2 },
          { optionText: "Không", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có tuổi trên 50 không?",
        order: 6,
        options: [
          { optionText: "Trên 60 tuổi", scoreValue: 3 },
          { optionText: "50-60 tuổi", scoreValue: 2 },
          { optionText: "Dưới 50 tuổi", scoreValue: 0 }
        ]
      }
    ],
    results: [
      {
        minScore: 0,
        maxScore: 4,
        title: "Nguy cơ thấp",
        description: "Nguy cơ mắc bệnh tim mạch của bạn hiện tại thấp. Hãy tiếp tục duy trì lối sống lành mạnh.",
        severity: "low",
        recommendations: [
          "Duy trì chế độ ăn uống lành mạnh, ít chất béo và muối",
          "Tập thể dục ít nhất 30 phút mỗi ngày",
          "Không hút thuốc lá",
          "Kiểm tra huyết áp và cholesterol định kỳ"
        ]
      },
      {
        minScore: 5,
        maxScore: 10,
        title: "Nguy cơ trung bình",
        description: "Bạn có một số yếu tố nguy cơ tim mạch. Nên thay đổi lối sống và kiểm tra sức khỏe định kỳ.",
        severity: "medium",
        recommendations: [
          "Giảm các yếu tố nguy cơ như hút thuốc, thừa cân",
          "Tăng cường hoạt động thể chất",
          "Chế độ ăn uống lành mạnh",
          "Đến bác sĩ để kiểm tra huyết áp, cholesterol, đường huyết"
        ]
      },
      {
        minScore: 11,
        maxScore: 18,
        title: "Nguy cơ cao",
        description: "Bạn có nhiều yếu tố nguy cơ tim mạch. Nên đến bác sĩ tim mạch để được đánh giá và tư vấn kịp thời.",
        severity: "high",
        recommendations: [
          "Đến bác sĩ tim mạch để được kiểm tra và đánh giá",
          "Thực hiện các xét nghiệm cần thiết: ECG, siêu âm tim, xét nghiệm máu",
          "Tuân thủ điều trị và thay đổi lối sống theo chỉ định",
          "Theo dõi định kỳ và điều chỉnh điều trị khi cần"
        ]
      }
    ]
  },
  {
    name: "Bài kiểm tra nguy cơ mắc bệnh Alzheimer",
    slug: "alzheimer",
    description: "Đánh giá nguy cơ mắc bệnh Alzheimer",
    shortDescription: "Kiểm tra các dấu hiệu và yếu tố nguy cơ của bệnh Alzheimer",
    sortOrder: 6,
    questions: [
      {
        questionText: "Bạn có thường xuyên quên điều mới xảy ra như quên chỗ để đồ vật, quên tên người mới được giới thiệu, hỏi lặp lại nhiều lần một vấn đề không?",
        order: 1,
        options: [
          { optionText: "Có, nhiều", scoreValue: 3 },
          { optionText: "Có, nhưng mức độ không nhiều", scoreValue: 1 },
          { optionText: "Không", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có gặp khó khăn trong việc lập kế hoạch hoặc giải quyết vấn đề không?",
        order: 2,
        options: [
          { optionText: "Rất khó", scoreValue: 3 },
          { optionText: "Khó một chút", scoreValue: 1 },
          { optionText: "Không khó", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có cảm thấy khó khăn trong việc hoàn thành các công việc quen thuộc ở nhà hoặc nơi làm việc không?",
        order: 3,
        options: [
          { optionText: "Rất khó", scoreValue: 3 },
          { optionText: "Khó một chút", scoreValue: 1 },
          { optionText: "Không khó", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có cảm thấy bối rối về thời gian hoặc địa điểm không?",
        order: 4,
        options: [
          { optionText: "Thường xuyên", scoreValue: 3 },
          { optionText: "Thỉnh thoảng", scoreValue: 1 },
          { optionText: "Hiếm khi", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có tuổi trên 65 không?",
        order: 5,
        options: [
          { optionText: "Trên 75 tuổi", scoreValue: 3 },
          { optionText: "65-75 tuổi", scoreValue: 2 },
          { optionText: "Dưới 65 tuổi", scoreValue: 0 }
        ]
      },
      {
        questionText: "Bạn có tiền sử gia đình mắc bệnh Alzheimer không?",
        order: 6,
        options: [
          { optionText: "Có, bố hoặc mẹ", scoreValue: 2 },
          { optionText: "Có, anh chị em", scoreValue: 1 },
          { optionText: "Không", scoreValue: 0 }
        ]
      }
    ],
    results: [
      {
        minScore: 0,
        maxScore: 4,
        title: "Nguy cơ thấp",
        description: "Nguy cơ mắc bệnh Alzheimer của bạn hiện tại thấp. Hãy tiếp tục duy trì lối sống lành mạnh để bảo vệ sức khỏe não bộ.",
        severity: "low",
        recommendations: [
          "Duy trì hoạt động thể chất thường xuyên",
          "Kích thích trí não với các hoạt động như đọc sách, chơi cờ, học ngôn ngữ mới",
          "Duy trì mối quan hệ xã hội tích cực",
          "Chế độ ăn uống lành mạnh với nhiều rau xanh và cá"
        ]
      },
      {
        minScore: 5,
        maxScore: 9,
        title: "Nguy cơ trung bình",
        description: "Bạn có một số dấu hiệu và yếu tố nguy cơ. Nên đến bác sĩ để được đánh giá và tư vấn.",
        severity: "medium",
        recommendations: [
          "Đến bác sĩ thần kinh để được đánh giá",
          "Thực hiện các bài kiểm tra nhận thức chuyên sâu",
          "Tăng cường các hoạt động kích thích trí não",
          "Theo dõi các triệu chứng và ghi chép lại"
        ]
      },
      {
        minScore: 10,
        maxScore: 17,
        title: "Nguy cơ cao",
        description: "Bạn có nhiều dấu hiệu và yếu tố nguy cơ. Nên đến cơ sở y tế chuyên khoa ngay để được kiểm tra và đánh giá chi tiết.",
        severity: "high",
        recommendations: [
          "Đến bác sĩ thần kinh ngay để được đánh giá chi tiết",
          "Thực hiện các xét nghiệm và kiểm tra nhận thức chuyên sâu",
          "Có người thân đi cùng khi thăm khám",
          "Tuân thủ điều trị và các biện pháp can thiệp theo chỉ định",
          "Tham gia các hoạt động trị liệu và phục hồi chức năng nhận thức"
        ]
      }
    ]
  }
];

const seedHealthChecks = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/smart-pharmacy";
    await connectDatabase(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await HealthCheckResult.deleteMany({});
    await AnswerOption.deleteMany({});
    await Question.deleteMany({});
    await HealthCheck.deleteMany({});

    console.log("Cleared existing health check data");

    // Insert health checks
    for (const checkData of healthChecksData) {
      const { questions, results, ...checkInfo } = checkData;
      
      const healthCheck = await HealthCheck.create(checkInfo);
      console.log(`Created health check: ${healthCheck.name}`);

      // Insert questions
      for (const questionData of questions) {
        const { options, ...questionInfo } = questionData;
        const question = await Question.create({
          ...questionInfo,
          healthCheckId: healthCheck._id
        });

        // Insert answer options
        for (const optionData of options) {
          await AnswerOption.create({
            ...optionData,
            questionId: question._id
          });
        }
      }

      // Insert results
      for (const resultData of results) {
        await HealthCheckResult.create({
          ...resultData,
          healthCheckId: healthCheck._id
        });
      }

      console.log(`  - Created ${questions.length} questions`);
      console.log(`  - Created ${results.length} results`);
    }

    console.log("\n✅ Health checks seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding health checks:", error);
    process.exit(1);
  }
};

seedHealthChecks();

