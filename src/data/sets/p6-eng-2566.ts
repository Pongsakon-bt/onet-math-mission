import type { Exam } from "../exam-types";
import q1 from "@/assets/exam/p6-eng-2566-q1.jpg.asset.json";
import q3 from "@/assets/exam/p6-eng-2566-q3.jpg.asset.json";
import q5 from "@/assets/exam/p6-eng-2566-q5.jpg.asset.json";
import q7 from "@/assets/exam/p6-eng-2566-q7.jpg.asset.json";
import q8 from "@/assets/exam/p6-eng-2566-q8.jpg.asset.json";
import q9 from "@/assets/exam/p6-eng-2566-q9.jpg.asset.json";
import q10 from "@/assets/exam/p6-eng-2566-q10.jpg.asset.json";
import q32 from "@/assets/exam/p6-eng-2566-q32.jpg.asset.json";

// Answer key: source PDF page 24 (ชุด 100).
export const exam: Exam = {
  "level": "p6",
  "subject": "eng",
  "year": 2566,
  "title": "O-NET ภาษาอังกฤษ ป.6",
  "code": "รหัสวิชา 63 · ชุด 100",
  "examDate": "สอบ 10 กุมภาพันธ์ 2567 (ปีการศึกษา 2566)",
  "minutes": 60,
  "questions": [
    {
      "id": "p6-eng-2566-1",
      "no": 1,
      "topic": "เทศกาล",
      "points": 3.125,
      "prompt": "Daisy is making this card.  What should she write on the card?",
      "type": "mcq",
      "choices": [
        {
          "text": "Left or Right"
        },
        {
          "text": "Trick or Treat"
        },
        {
          "text": "Fish and Chips"
        },
        {
          "text": "Sweet and Sour"
        }
      ],
      "answer": 2,
      "steps": [
        "ฟักทองแกะสลักเป็นสัญลักษณ์ฮาโลวีน จึงใช้คำว่า Trick or Treat"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ],
      "figure": {
        "kind": "image",
        "src": q1.url,
        "alt": "การ์ดรูปฟักทองฮาโลวีน"
      }
    },
    {
      "id": "p6-eng-2566-2",
      "no": 2,
      "topic": "การอ่าน",
      "points": 3.125,
      "prompt": "Read the sentences.\nWhich sentence is correct?",
      "type": "mcq",
      "choices": [
        {
          "text": "I enjoy drawing cartoons."
        },
        {
          "text": "I like making short movies."
        },
        {
          "text": "I love watching TV cartoons."
        },
        {
          "text": "I spend my free time writing stories."
        }
      ],
      "answer": 3,
      "steps": [
        "ผู้พูดชอบดูการ์ตูนทางโทรทัศน์ ไม่ได้วาดการ์ตูนหรือเขียนเรื่อง"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ],
      "passage": "My hobbies are reading and watching TV.  I always enjoy reading short stories and watching cartoons."
    },
    {
      "id": "p6-eng-2566-3",
      "no": 3,
      "topic": "อาหาร",
      "points": 3.125,
      "prompt": "Which picture shows American food?",
      "type": "mcq",
      "choices": [
        {
          "text": "1"
        },
        {
          "text": "2"
        },
        {
          "text": "3"
        },
        {
          "text": "4"
        }
      ],
      "answer": 1,
      "steps": [
        "ภาพแรกเป็นอาหารเช้าแบบอเมริกัน มีแพนเค้กและไข่"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ],
      "figure": {
        "kind": "image",
        "src": q3.url,
        "alt": "ภาพตัวเลือกอาหารสี่ชนิด"
      }
    },
    {
      "id": "p6-eng-2566-4",
      "no": 4,
      "topic": "การอ่านตาราง",
      "points": 3.125,
      "prompt": "Look at the price list.\nJill buys a dozen eggs and three salted eggs.  How much does she pay?",
      "type": "mcq",
      "choices": [
        {
          "text": "Sixty-five"
        },
        {
          "text": "Sixty-six"
        },
        {
          "text": "Seventy"
        },
        {
          "text": "Seventy-one"
        }
      ],
      "answer": 2,
      "steps": [
        "ไข่หนึ่งโหล 45 บาท และไข่เค็มสามฟอง 21 บาท รวม 66 บาท"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ],
      "passage": "EGG PRICE LIST ฿\nONE EGG | HALF A DOZEN | A DOZEN\nEGGS: 4.50 | 25 | 45\nSALTED EGGS: 7 | 40 | 75"
    },
    {
      "id": "p6-eng-2566-5",
      "no": 5,
      "topic": "ป้ายสัญลักษณ์",
      "points": 3.125,
      "prompt": "Look at the sign.\nWhat does it mean?",
      "type": "mcq",
      "choices": [
        {
          "text": "Paint a can green."
        },
        {
          "text": "Cut the green trees."
        },
        {
          "text": "Make a good throw."
        },
        {
          "text": "Keep the place clean."
        }
      ],
      "answer": 4,
      "steps": [
        "Do not litter คือห้ามทิ้งขยะ จึงหมายถึงให้รักษาความสะอาด"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ],
      "figure": {
        "kind": "image",
        "src": q5.url,
        "alt": "ป้าย THINK GREEN DO NOT LITTER"
      }
    },
    {
      "id": "p6-eng-2566-6",
      "no": 6,
      "topic": "ประกาศ",
      "points": 3.125,
      "prompt": "Look at the notice.\nWhat is the best name for the notice?",
      "type": "mcq",
      "choices": [
        {
          "text": "Study Time"
        },
        {
          "text": "Reading Tips"
        },
        {
          "text": "Library Rules"
        },
        {
          "text": "Health Guidelines"
        }
      ],
      "answer": 3,
      "steps": [
        "ข้อกำหนดเกี่ยวกับดูแลและยืมคืนหนังสือเป็นกฎห้องสมุด"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ],
      "passage": "• Take care of all the books/materials.\n• Clean up after yourself.\n• Check out books before leaving.\n• Return books on time."
    },
    {
      "id": "p6-eng-2566-7",
      "no": 7,
      "topic": "การอ่าน",
      "points": 3.125,
      "prompt": "Look at the picture.\nWhich sentence is correct?",
      "type": "mcq",
      "choices": [
        {
          "text": "Five earthworms like hearts."
        },
        {
          "text": "An earthworm has one heart."
        },
        {
          "text": "Five earthworms are in the picture."
        },
        {
          "text": "An earthworm has more than one heart."
        }
      ],
      "answer": 4,
      "steps": [
        "ข้อความระบุว่ามีหัวใจห้าดวง จึงมากกว่าหนึ่งดวง"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ],
      "figure": {
        "kind": "image",
        "src": q7.url,
        "alt": "ภาพไส้เดือนพร้อมข้อความ EARTHWORMS HAVE FIVE HEARTS"
      }
    },
    {
      "id": "p6-eng-2566-8",
      "no": 8,
      "topic": "ทิศทาง",
      "points": 3.125,
      "prompt": "Which sign are they talking about?",
      "type": "mcq",
      "choices": [
        {
          "text": "1"
        },
        {
          "text": "2"
        },
        {
          "text": "3"
        },
        {
          "text": "4"
        }
      ],
      "answer": 1,
      "steps": [
        "turn left หมายถึงเลี้ยวซ้าย ตรงกับป้ายแรก"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ],
      "passage": "Matt: Where should we go next?\nRyan: Keep going and turn left.  Just follow the sign.",
      "figure": {
        "kind": "image",
        "src": q8.url,
        "alt": "ตัวเลือกป้ายจราจรสี่ภาพ"
      }
    },
    {
      "id": "p6-eng-2566-9",
      "no": 9,
      "topic": "แผนที่",
      "points": 3.125,
      "prompt": "Read the sentences.\nWhich map is correct?",
      "type": "mcq",
      "choices": [
        {
          "text": "1"
        },
        {
          "text": "2"
        },
        {
          "text": "3"
        },
        {
          "text": "4"
        }
      ],
      "answer": 2,
      "steps": [
        "แผนที่ที่สองเริ่มจากโรงเรียนบน Maple เลี้ยวขวาแล้วซ้ายเข้า Oak และขวาที่ Pine ไปบ้าน"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ],
      "passage": "Zara walks from school on Maple Street, turns right at the corner and turns left onto Oak Street.  When she arrives at Pine Street, she turns right and crosses the road to her house.",
      "figure": {
        "kind": "image",
        "src": q9.url,
        "alt": "ตัวเลือกแผนที่เส้นทางสี่ภาพ"
      }
    },
    {
      "id": "p6-eng-2566-10",
      "no": 10,
      "topic": "แผนภูมิ",
      "points": 3.125,
      "prompt": "Read the sentence.\nWhich pie chart is correct?",
      "type": "mcq",
      "choices": [
        {
          "text": "1"
        },
        {
          "text": "2"
        },
        {
          "text": "3"
        },
        {
          "text": "4"
        }
      ],
      "answer": 4,
      "steps": [
        "แผนภูมิที่สี่แสดงส่วนของเอเชียใหญ่ที่สุด"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ],
      "passage": "Of the six continents, Asia has the largest population.",
      "figure": {
        "kind": "image",
        "src": q10.url,
        "alt": "ตัวเลือกแผนภูมิวงกลมประชากรโลก"
      }
    },
    {
      "id": "p6-eng-2566-11",
      "no": 11,
      "topic": "การอ่านบทสนทนา",
      "points": 3.125,
      "prompt": "Read the dialogue.\nWhich sentence is correct?",
      "type": "mcq",
      "choices": [
        {
          "text": "They are talking at 3 p.m."
        },
        {
          "text": "They are not at the box office."
        },
        {
          "text": "Peter will have to wait until 3 p.m."
        },
        {
          "text": "Peter won’t have to show the ticket today."
        }
      ],
      "answer": 3,
      "steps": [
        "ห้องจำหน่ายตั๋วเปิดบ่ายสาม ปีเตอร์จึงต้องรอถึงเวลานั้น"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ],
      "passage": "Staff: I’m sorry. You can’t change the ticket now.  The box office opens 3 p.m.\nPeter: Oh, no!  I can’t wait that long."
    },
    {
      "id": "p6-eng-2566-12",
      "no": 12,
      "topic": "กาล",
      "points": 3.125,
      "prompt": "Which sentence is correct?",
      "type": "mcq",
      "choices": [
        {
          "text": "Mrs. Green is teaching her students now."
        },
        {
          "text": "Mr. Thomas taught his students tomorrow."
        },
        {
          "text": "Mr. Thomas has shown the world map yesterday."
        },
        {
          "text": "Mrs. Green will show the world map two days ago."
        }
      ],
      "answer": 1,
      "steps": [
        "is teaching ใช้กับ now ได้ถูกต้อง ส่วนข้ออื่นใช้กาลไม่ตรงกับคำบอกเวลา"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ]
    },
    {
      "id": "p6-eng-2566-13",
      "no": 13,
      "topic": "การออกเสียง",
      "points": 3.125,
      "prompt": "Which question has a different intonation?",
      "type": "mcq",
      "choices": [
        {
          "text": "How high is it?"
        },
        {
          "text": "Is it very high?"
        },
        {
          "text": "Why is it so high?"
        },
        {
          "text": "What is its height?"
        }
      ],
      "answer": 2,
      "steps": [
        "คำถาม Yes/No มักลงท้ายเสียงสูง ต่างจากคำถาม Wh- ที่ลงเสียงต่ำ"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ]
    },
    {
      "id": "p6-eng-2566-14",
      "no": 14,
      "topic": "เครื่องหมายวรรคตอน",
      "points": 3.125,
      "prompt": "Which sentence has the correct punctuation?",
      "type": "mcq",
      "choices": [
        {
          "text": "Are you serious?"
        },
        {
          "text": "What do you think."
        },
        {
          "text": "How high is the flood;"
        },
        {
          "text": "Can you wait a minute!"
        }
      ],
      "answer": 1,
      "steps": [
        "ประโยคคำถาม Are you serious? ลงท้ายด้วยเครื่องหมายคำถามถูกต้อง"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ]
    },
    {
      "id": "p6-eng-2566-15",
      "no": 15,
      "topic": "บทสนทนา",
      "points": 3.125,
      "prompt": "Choose the best answer to complete the conversation.\nTeacher: Do you have any questions?\nStudent: ________",
      "type": "mcq",
      "choices": [
        {
          "text": "Yes, I like it."
        },
        {
          "text": "Yes, I will do it."
        },
        {
          "text": "No, I won’t come."
        },
        {
          "text": "No, I don’t think so."
        }
      ],
      "answer": 4,
      "steps": [
        "คำตอบปฏิเสธว่าไม่มีคำถามใช้ No, I don’t think so."
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ]
    },
    {
      "id": "p6-eng-2566-16",
      "no": 16,
      "topic": "บทสนทนา",
      "points": 3.125,
      "prompt": "Choose the best answer to complete the conversation.\nTeacher: Please don’t make so much noise! This is a co-learning space.\nStudent: ________",
      "type": "mcq",
      "choices": [
        {
          "text": "I’m sorry."
        },
        {
          "text": "Not at all."
        },
        {
          "text": "My pleasure."
        },
        {
          "text": "Don’t mention it."
        }
      ],
      "answer": 1,
      "steps": [
        "เมื่อถูกเตือนเรื่องเสียงดังควรกล่าวขอโทษ"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ]
    },
    {
      "id": "p6-eng-2566-17",
      "no": 17,
      "topic": "บทสนทนา",
      "points": 3.125,
      "prompt": "Choose the best answer to complete the conversation.\nEthan: I can’t do this exercise.  ________\nDaniel: Certainly!",
      "type": "mcq",
      "choices": [
        {
          "text": "May I please help you?"
        },
        {
          "text": "Can she help him, please?"
        },
        {
          "text": "Could you please help me?"
        },
        {
          "text": "Should he help her, please?"
        }
      ],
      "answer": 3,
      "steps": [
        "อีธานทำแบบฝึกหัดไม่ได้จึงขอให้แดเนียลช่วย"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ]
    },
    {
      "id": "p6-eng-2566-18",
      "no": 18,
      "topic": "บทสนทนา",
      "points": 3.125,
      "prompt": "Choose the best answer to complete the conversation.\nMeg: What is she like?\nBob: ________ I like her.",
      "type": "mcq",
      "choices": [
        {
          "text": "She has a cat."
        },
        {
          "text": "She is very kind."
        },
        {
          "text": "She is doing well."
        },
        {
          "text": "She prefers ice cream."
        }
      ],
      "answer": 2,
      "steps": [
        "What is she like? ถามลักษณะนิสัย จึงตอบว่าเธอใจดี"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ]
    },
    {
      "id": "p6-eng-2566-19",
      "no": 19,
      "topic": "บทสนทนา",
      "points": 3.125,
      "prompt": "Choose the best answer to complete the conversation.\nPaul: I haven’t finished the essay.  ________\nMark: This afternoon.  Hurry up!",
      "type": "mcq",
      "choices": [
        {
          "text": "What have you done today?"
        },
        {
          "text": "Why are we studying English?"
        },
        {
          "text": "How can you use a dictionary?"
        },
        {
          "text": "When do we have to hand it in?"
        }
      ],
      "answer": 4,
      "steps": [
        "This afternoon ตอบคำถามเวลาที่ต้องส่งงาน"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ]
    },
    {
      "id": "p6-eng-2566-20",
      "no": 20,
      "topic": "บทสนทนา",
      "points": 3.125,
      "prompt": "Choose the best answer to complete the conversation.\nSam: I don’t feel well.\nSara: ________ You’ll be better.",
      "type": "mcq",
      "choices": [
        {
          "text": "You can work harder."
        },
        {
          "text": "We can go to the store."
        },
        {
          "text": "You should get some rest."
        },
        {
          "text": "We should play a little longer."
        }
      ],
      "answer": 3,
      "steps": [
        "เมื่อไม่สบายควรแนะนำให้พักผ่อน"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ]
    },
    {
      "id": "p6-eng-2566-21",
      "no": 21,
      "topic": "บทสนทนา",
      "points": 3.125,
      "prompt": "Choose the best answer to complete the conversation.\nGreg: What do you think about my pink shirt?\nHelen: ________ Pink is my favourite.",
      "type": "mcq",
      "choices": [
        {
          "text": "Not bad."
        },
        {
          "text": "Not good."
        },
        {
          "text": "Very well."
        },
        {
          "text": "Very much."
        }
      ],
      "answer": 1,
      "steps": [
        "Not bad เป็นการแสดงความเห็นเชิงบวกสอดคล้องกับชอบสีชมพู"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ]
    },
    {
      "id": "p6-eng-2566-22",
      "no": 22,
      "topic": "บทสนทนา",
      "points": 3.125,
      "prompt": "Choose the best answer to complete the conversation.\nJohn: Could you tell me your phone number?\nHarriet: ________ I don’t give my number to strangers.",
      "type": "mcq",
      "choices": [
        {
          "text": "Yes, please."
        },
        {
          "text": "That’s alright."
        },
        {
          "text": "No, thank you."
        },
        {
          "text": "Sorry.  I’m afraid not."
        }
      ],
      "answer": 4,
      "steps": [
        "เป็นการปฏิเสธคำขออย่างสุภาพ เพราะไม่ให้เบอร์คนแปลกหน้า"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ]
    },
    {
      "id": "p6-eng-2566-23",
      "no": 23,
      "topic": "บทสนทนา",
      "points": 3.125,
      "prompt": "Choose the best answer to complete the conversation.\nRoss goes to the bank after lunch.\nTeller: ________ Can I help you?\nRoss: I’d like to send some money abroad.",
      "type": "mcq",
      "choices": [
        {
          "text": "See you later."
        },
        {
          "text": "Good afternoon."
        },
        {
          "text": "How do you do?"
        },
        {
          "text": "How did you come?"
        }
      ],
      "answer": 2,
      "steps": [
        "หลังอาหารกลางวันเป็นเวลาบ่าย จึงทักทาย Good afternoon."
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ]
    },
    {
      "id": "p6-eng-2566-24",
      "no": 24,
      "topic": "บทสนทนา",
      "points": 3.125,
      "prompt": "Choose the best answer to complete the conversation.\nEarl: Where is your house?\nFern: ________",
      "type": "mcq",
      "choices": [
        {
          "text": "It’s ten meters high."
        },
        {
          "text": "There are ten meters."
        },
        {
          "text": "There is one kilometer left."
        },
        {
          "text": "It’s one kilometer from here."
        }
      ],
      "answer": 4,
      "steps": [
        "คำถามถามที่ตั้งบ้าน คำตอบบอกระยะห่างจากที่นี่ได้เหมาะสม"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ]
    },
    {
      "id": "p6-eng-2566-25",
      "no": 25,
      "topic": "บทสนทนา",
      "points": 3.125,
      "prompt": "Choose the best answer to complete the conversation.\nAmal: You look so sad.\nBhanu: ________",
      "type": "mcq",
      "choices": [
        {
          "text": "I’m clever. It’s a great time."
        },
        {
          "text": "I feel bored. I got a nice gift."
        },
        {
          "text": "I don’t feel good. I got bad news."
        },
        {
          "text": "I’m not angry. It’s all my pleasure."
        }
      ],
      "answer": 3,
      "steps": [
        "การได้รับข่าวร้ายทำให้เศร้า สอดคล้องกับคำทัก"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ]
    },
    {
      "id": "p6-eng-2566-26",
      "no": 26,
      "topic": "บทสนทนา",
      "points": 3.125,
      "prompt": "Choose the best answer to complete the conversation.\nAurora: What do you think about your hometown?\nSage: ________",
      "type": "mcq",
      "choices": [
        {
          "text": "I love it. It’s a quiet place."
        },
        {
          "text": "I went there. It’s near my house."
        },
        {
          "text": "I came here. There are plenty of fish."
        },
        {
          "text": "I enjoy it. There’s too much pollution."
        }
      ],
      "answer": 1,
      "steps": [
        "ตอบความคิดเห็นว่ารักบ้านเกิดเพราะเป็นที่เงียบสงบ"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ]
    },
    {
      "id": "p6-eng-2566-27",
      "no": 27,
      "topic": "บทสนทนา",
      "points": 3.125,
      "prompt": "Choose the best answer to complete the conversation.\nLevi: What should I do with this basket?  It’s heavy.\nDave: Be careful!  ________",
      "type": "mcq",
      "choices": [
        {
          "text": "Put it on the table."
        },
        {
          "text": "Take me to the store."
        },
        {
          "text": "Write it on the board."
        },
        {
          "text": "Walk me to the corner."
        }
      ],
      "answer": 1,
      "steps": [
        "ตะกร้าหนักจึงแนะนำให้วางบนโต๊ะ"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ]
    },
    {
      "id": "p6-eng-2566-28",
      "no": 28,
      "topic": "บทสนทนา",
      "points": 3.125,
      "prompt": "Choose the best answer to complete the conversation.\nTom and Susan are about to order food at the food court.\nTom: Oh, Mom’s calling.  I need to answer it.  ________\nSusan: Okay.  Anything else?\nTom: And water, please.",
      "type": "mcq",
      "choices": [
        {
          "text": "May I sell ice cream?"
        },
        {
          "text": "Should you bake a cake?"
        },
        {
          "text": "Can you get me fried rice?"
        },
        {
          "text": "Will I make pizza for you?"
        }
      ],
      "answer": 3,
      "steps": [
        "ทอมต้องรับโทรศัพท์ จึงขอให้ซูซานซื้อข้าวผัดให้"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ]
    },
    {
      "id": "p6-eng-2566-29",
      "no": 29,
      "topic": "บทสนทนา",
      "points": 3.125,
      "prompt": "Choose the best answer to complete the conversation.\nIan: Hey, Carl!  I’m having my birthday party this weekend.\n________\nCarl: I’d love to.  When?\nIan: This Saturday afternoon.",
      "type": "mcq",
      "choices": [
        {
          "text": "You’d be free."
        },
        {
          "text": "I’d like you to come."
        },
        {
          "text": "You’ve gone very far."
        },
        {
          "text": "I think you should go away."
        }
      ],
      "answer": 2,
      "steps": [
        "I’d love to เป็นการตอบรับคำเชิญมางานวันเกิด"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ]
    },
    {
      "id": "p6-eng-2566-30",
      "no": 30,
      "topic": "บทสนทนา",
      "points": 3.125,
      "prompt": "Choose the best answer to complete the conversation.\nAt the cinema\nKenji: Let’s watch this film.\nNori: Do you think I’d like it?\nKenji: ________ It’s funny.",
      "type": "mcq",
      "choices": [
        {
          "text": "Too much."
        },
        {
          "text": "Not so much."
        },
        {
          "text": "You think so."
        },
        {
          "text": "You’ll love it."
        }
      ],
      "answer": 4,
      "steps": [
        "หนังตลกจึงมั่นใจว่าอีกฝ่ายจะชอบ"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ]
    },
    {
      "id": "p6-eng-2566-31",
      "no": 31,
      "topic": "บทสนทนา",
      "points": 3.125,
      "prompt": "Choose the best answer to complete the conversation.\nViolet: Do you know that boy with glasses?\nLiam: Ah!  ________\nViolet: Really?  I thought he was an actor.",
      "type": "mcq",
      "choices": [
        {
          "text": "That’s a very tall boy."
        },
        {
          "text": "His glasses are quite big."
        },
        {
          "text": "He’s Sean, my classmate."
        },
        {
          "text": "He must have an eye problem."
        }
      ],
      "answer": 3,
      "steps": [
        "คำถามถามว่ารู้จักหรือไม่ จึงตอบระบุชื่อและว่าเป็นเพื่อนร่วมชั้น"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ]
    },
    {
      "id": "p6-eng-2566-32",
      "no": 32,
      "topic": "เทศกาล",
      "points": 3.125,
      "prompt": "James: A present!  This must be Christmas.\nTara: This was on ________.  Young people also give presents on that day.",
      "type": "mcq",
      "choices": [
        {
          "text": "Easter"
        },
        {
          "text": "Halloween"
        },
        {
          "text": "Children’s Day"
        },
        {
          "text": "Mother’s Day"
        }
      ],
      "answer": 4,
      "steps": [
        "ภาพเป็นการให้ของขวัญแก่แม่ จึงเป็นวันแม่"
      ],
      "hints": [
        "อ่านคำถามและบริบทให้ครบก่อนเลือกคำตอบ",
        "เปรียบเทียบความหมายของตัวเลือกกับข้อมูลที่ให้มา"
      ],
      "passage": "Tara is a Prathom 6 student.  James is an exchange student.  They are looking at a photo from Tara’s family album.",
      "figure": {
        "kind": "image",
        "src": q32.url,
        "alt": "ภาพเด็กสาวให้ของขวัญแก่แม่"
      }
    }
  ]
};

