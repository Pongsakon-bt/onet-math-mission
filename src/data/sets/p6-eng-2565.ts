import type { Exam } from "../exam-types";
import q1 from "@/assets/exam/p6-eng-2565-q1.jpg.asset.json";
import q3 from "@/assets/exam/p6-eng-2565-q3.jpg.asset.json";
import q4 from "@/assets/exam/p6-eng-2565-q4.jpg.asset.json";
import q6 from "@/assets/exam/p6-eng-2565-q6.jpg.asset.json";
import q7 from "@/assets/exam/p6-eng-2565-q7.jpg.asset.json";
import q8 from "@/assets/exam/p6-eng-2565-q8.jpg.asset.json";
import q9 from "@/assets/exam/p6-eng-2565-q9.jpg.asset.json";
import q10 from "@/assets/exam/p6-eng-2565-q10.jpg.asset.json";
import q11 from "@/assets/exam/p6-eng-2565-q11.jpg.asset.json";
import q15 from "@/assets/exam/p6-eng-2565-q15.jpg.asset.json";
import q20 from "@/assets/exam/p6-eng-2565-q20.jpg.asset.json";
import q22 from "@/assets/exam/p6-eng-2565-q22.jpg.asset.json";
import q24 from "@/assets/exam/p6-eng-2565-q24.jpg.asset.json";
import q28 from "@/assets/exam/p6-eng-2565-q28.jpg.asset.json";
import q32 from "@/assets/exam/p6-eng-2565-q32.jpg.asset.json";

export const exam: Exam = {
  level: "p6",
  subject: "eng",
  year: 2565,
  title: "O-NET ภาษาอังกฤษ ป.6",
  code: "รหัสวิชา 63 · ชุด 100",
  examDate: "สอบ 11 กุมภาพันธ์ 2566 (ปีการศึกษา 2565)",
  minutes: 60,
  questions: [
  {
    "id": "p6-eng-2565-1",
    "no": 1,
    "topic": "เทศกาล",
    "points": 3.125,
    "prompt": "Daisy is making this card. What should she write on the card?",
    "steps": [
      "ภาพการ์ดมีบรรยากาศเทศกาลฤดูหนาว จึงเหมาะกับ Happy Holidays"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "figure": { "kind": "image", "src": q1.url, "alt": "ภาพการ์ดเทศกาลฤดูหนาว" },
    "type": "mcq",
    "choices": [
      {
        "text": "Happy Easter"
      },
      {
        "text": "Happy Father’s Day"
      },
      {
        "text": "Happy Holidays"
      },
      {
        "text": "Happy Valentine’s Day"
      }
    ],
    "answer": 3
  },
  {
    "id": "p6-eng-2565-2",
    "no": 2,
    "topic": "การอ่านบทสนทนา",
    "points": 3.125,
    "prompt": "Read the dialogue.\nWhich sentence is correct?",
    "steps": [
      "Ann บอกว่าจะขับรถไปและอยู่สามวัน"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "passage": "Ann: I’m going to Phuket this long weekend.\nBell: Wow! How are you travelling and for how long?\nAnn: I’ll drive and stay there for three days.",
    "type": "mcq",
    "choices": [
      {
        "text": "Bell is driving Ann to Phuket."
      },
      {
        "text": "Ann is going to Phuket by car."
      },
      {
        "text": "Bell and Ann are staying in Phuket."
      },
      {
        "text": "Ann and Bell are planning a trip to Phuket."
      }
    ],
    "answer": 2
  },
  {
    "id": "p6-eng-2565-3",
    "no": 3,
    "topic": "กีฬา",
    "points": 3.125,
    "prompt": "Which picture shows an American sport?",
    "steps": [
      "ภาพที่ 4 คืออเมริกันฟุตบอล"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "figure": { "kind": "image", "src": q3.url, "alt": "ภาพกีฬาสี่ตัวเลือกตามต้นฉบับ" },
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
    "answer": 4
  },
  {
    "id": "p6-eng-2565-4",
    "no": 4,
    "topic": "การอ่านข้อมูล",
    "points": 3.125,
    "prompt": "Look at the picture.",
    "steps": [
      "ข้อความระบุว่าตุ่นปากเป็ดไม่มีกระเพาะอาหาร"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "figure": { "kind": "image", "src": q4.url, "alt": "ข้อความ Did you Know? เกี่ยวกับ platypus" },
    "promptAfter": "Which sentence is correct?",
    "type": "mcq",
    "choices": [
      {
        "text": "A platypus has one stomach."
      },
      {
        "text": "Every animal has one stomach."
      },
      {
        "text": "A platypus does not have a stomach."
      },
      {
        "text": "Every animal does not have a stomach."
      }
    ],
    "answer": 3
  },
  {
    "id": "p6-eng-2565-5",
    "no": 5,
    "topic": "ครอบครัว",
    "points": 3.125,
    "prompt": "Read the sentences.\nWhich sentence is correct?",
    "steps": [
      "มีผู้มาเยี่ยมสามคน ได้แก่ Charlotte, George และ Louis"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "passage": "My brothers and sister are visiting me tomorrow. Charlotte is my sister. George and Louis are my brothers. I’m happy to see them all.",
    "type": "mcq",
    "choices": [
      {
        "text": "Six people are visiting me."
      },
      {
        "text": "Three people are coming to my house."
      },
      {
        "text": "Charlotte, George, Louis and their brothers are visiting me."
      },
      {
        "text": "Charlotte, George and their sisters are coming to my house."
      }
    ],
    "answer": 2
  },
  {
    "id": "p6-eng-2565-6",
    "no": 6,
    "topic": "ประกาศ",
    "points": 3.125,
    "prompt": "Look at the notice.",
    "steps": [
      "ข้อปฏิบัติทั้งหมดเกี่ยวกับการดูแลสวน จึงเป็นกฎของสวน"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "figure": { "kind": "image", "src": q6.url, "alt": "ประกาศดูแลผัก ดอกไม้ สัตว์ และความสะอาดของสวน" },
    "promptAfter": "What is the best name for the notice?",
    "type": "mcq",
    "choices": [
      {
        "text": "Flower Beds"
      },
      {
        "text": "Creature Land"
      },
      {
        "text": "Garden Rules"
      },
      {
        "text": "Vegetable Market"
      }
    ],
    "answer": 3
  },
  {
    "id": "p6-eng-2565-7",
    "no": 7,
    "topic": "ป้ายสัญลักษณ์",
    "points": 3.125,
    "prompt": "Look at the sign.",
    "steps": [
      "CCTV in operation หมายถึงกล้องวงจรปิดกำลังทำงาน"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "figure": { "kind": "image", "src": q7.url, "alt": "ป้าย CCTV in operation" },
    "promptAfter": "What does the sign mean?",
    "type": "mcq",
    "choices": [
      {
        "text": "A camera is on."
      },
      {
        "text": "People are making a movie."
      },
      {
        "text": "You can watch TV programs here."
      },
      {
        "text": "A microphone makes your voice louder."
      }
    ],
    "answer": 1
  },
  {
    "id": "p6-eng-2565-8",
    "no": 8,
    "topic": "ป้ายสัญลักษณ์",
    "points": 3.125,
    "prompt": "After having lunch at the canteen\nMatt: Can we leave the plates on the table?\nRyan: I don’t think so. Look at the sign.\n\nWhich sign are they talking about?",
    "steps": [
      "ป้ายที่ 2 ให้เก็บภาชนะหลังรับประทานอาหาร"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "figure": { "kind": "image", "src": q8.url, "alt": "ป้ายสี่ตัวเลือกตามต้นฉบับ" },
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
    "answer": 2
  },
  {
    "id": "p6-eng-2565-9",
    "no": 9,
    "topic": "เมนูอาหาร",
    "points": 3.125,
    "prompt": "Look at the menu.",
    "steps": [
      "โกโก้เย็น 25 และนมเย็น 20 รวม 45"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "figure": { "kind": "image", "src": q9.url, "alt": "เมนูเครื่องดื่มและราคา" },
    "promptAfter": "John: I want iced cocoa. What about you?\nLeah: Just milk. Umm, cold milk is better.\n\nHow much do they have to pay in total?",
    "type": "mcq",
    "choices": [
      {
        "text": "Thirty-Five"
      },
      {
        "text": "Forty"
      },
      {
        "text": "Forty-Five"
      },
      {
        "text": "Fifty"
      }
    ],
    "answer": 3
  },
  {
    "id": "p6-eng-2565-10",
    "no": 10,
    "topic": "การอ่านกราฟ",
    "points": 3.125,
    "prompt": "Read the sentences.\nStudents got lower scores in many subjects in 2021. They did better only in maths.\n\nWhich bar graph is correct?",
    "steps": [
      "กราฟที่ 3 มีคะแนนคณิตศาสตร์เพิ่มขึ้น แต่วิชาอื่นลดลง"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "figure": { "kind": "image", "src": q10.url, "alt": "กราฟแท่งสี่ตัวเลือกเปรียบเทียบคะแนนปี 2020 และ 2021" },
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
    "answer": 3
  },
  {
    "id": "p6-eng-2565-11",
    "no": 11,
    "topic": "การบอกทาง",
    "points": 3.125,
    "prompt": "Read the sentences.\nJennifer walks from the shop on East Road, turns left at the corner and turns right onto West Road. When she arrives at Main Road, she turns left and crosses the road to the pizzeria.\n\nWhich map is correct?",
    "steps": [
      "แผนที่ 1 แสดงเลี้ยวซ้ายจาก East Road แล้วขวาเข้า West Road และซ้ายที่ Main Road"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "figure": { "kind": "image", "src": q11.url, "alt": "แผนที่สี่ตัวเลือกแสดงร้านค้าและร้านพิซซ่า" },
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
    "answer": 1
  },
  {
    "id": "p6-eng-2565-12",
    "no": 12,
    "topic": "โครงสร้างประโยค",
    "points": 3.125,
    "prompt": "Which sentence is correct?",
    "steps": [
      "เรียงประธาน My friends and I ตามด้วยกริยาและส่วนขยาย"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "And I go to once a week the museum my friends."
      },
      {
        "text": "Once a week go to the museum my friends and I."
      },
      {
        "text": "Go to the museum and I my friends once a week."
      },
      {
        "text": "My friends and I go to the museum once a week."
      }
    ],
    "answer": 4
  },
  {
    "id": "p6-eng-2565-13",
    "no": 13,
    "topic": "การออกเสียง",
    "points": 3.125,
    "prompt": "Which question has a different intonation?",
    "steps": [
      "คำถาม Yes/No ใช้เสียงขึ้น ต่างจากคำถาม Wh- ที่มักลงเสียงท้าย"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "Why did they come late?"
      },
      {
        "text": "What is the weather like?"
      },
      {
        "text": "Have you finished it yet?"
      },
      {
        "text": "How often does he exercise?"
      }
    ],
    "answer": 3
  },
  {
    "id": "p6-eng-2565-14",
    "no": 14,
    "topic": "เครื่องหมายวรรคตอน",
    "points": 3.125,
    "prompt": "Which sentence has the correct punctuation?",
    "steps": [
      "ใช้จุลภาคหลัง No และจุดเมื่อจบประโยค"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "No, I can’t."
      },
      {
        "text": "Yes! I can;"
      },
      {
        "text": "Yes. we can;"
      },
      {
        "text": "No; we can’t!"
      }
    ],
    "answer": 1
  },
  {
    "id": "p6-eng-2565-15",
    "no": 15,
    "topic": "เทศกาล",
    "points": 3.125,
    "prompt": "Mali is a Prathom six student. Trisha is an exchange student.\nThey are looking at a picture of a Thai festival.",
    "steps": [
      "Trisha เห็นพลุจึงคิดว่าเป็นเทศกาลปีใหม่"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "figure": { "kind": "image", "src": q15.url, "alt": "ภาพเทศกาลและดอกไม้ไฟ" },
    "promptAfter": "Trisha: This must be ________. The fireworks are always amazing.\nMali: No, it’s not. It’s the Loy Krathong festival in Thailand.",
    "type": "mcq",
    "choices": [
      {
        "text": "New Year"
      },
      {
        "text": "Christmas"
      },
      {
        "text": "Halloween"
      },
      {
        "text": "Thanksgiving"
      }
    ],
    "answer": 1
  },
  {
    "id": "p6-eng-2565-16",
    "no": 16,
    "topic": "บทสนทนาอาหาร",
    "points": 3.125,
    "prompt": "Ava: You’re having rice and chicken again.\nLucas: Sure! ________\nAva: I can’t have the same dish every day.",
    "steps": [
      "Lucas กินอาหารเดิมเพราะชอบและอร่อย"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "You like it. It’s bad."
      },
      {
        "text": "I like it. It’s delicious."
      },
      {
        "text": "I hate rice. You love spaghetti."
      },
      {
        "text": "You love noodles. I hate chicken."
      }
    ],
    "answer": 2
  },
  {
    "id": "p6-eng-2565-17",
    "no": 17,
    "topic": "สุขภาพ",
    "points": 3.125,
    "prompt": "Ron: Hey, Sarah! You look tired. What’s the matter?\nSarah: ________ I think I’ve caught COVID-19.",
    "steps": [
      "Sarah รู้สึกไม่สบายและคิดว่าติดโควิด"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "I feel terrible."
      },
      {
        "text": "I look so good."
      },
      {
        "text": "You feel okay, too."
      },
      {
        "text": "You look tired, too."
      }
    ],
    "answer": 1
  },
  {
    "id": "p6-eng-2565-18",
    "no": 18,
    "topic": "บทสนทนา",
    "points": 3.125,
    "prompt": "Alisha told Brad that a thief broke into her house the night before.\nBrad: Did he steal anything?\nAlisha: ________ But he ate all my food!",
    "steps": [
      "ตอบปฏิเสธการขโมยแล้วบอกว่าแต่เขากินอาหารหมด"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "Of course."
      },
      {
        "text": "Maybe not."
      },
      {
        "text": "Yes, he did."
      },
      {
        "text": "No, he didn’t."
      }
    ],
    "answer": 4
  },
  {
    "id": "p6-eng-2565-19",
    "no": 19,
    "topic": "การกล่าวลา",
    "points": 3.125,
    "prompt": "Paula: I should get back to my class.\nSean: Me, too. ________",
    "steps": [
      "กำลังแยกย้ายกลับห้องเรียนจึงกล่าว See you"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "Hello."
      },
      {
        "text": "Hi there."
      },
      {
        "text": "See you."
      },
      {
        "text": "Good night."
      }
    ],
    "answer": 3
  },
  {
    "id": "p6-eng-2565-20",
    "no": 20,
    "topic": "การขอบคุณ",
    "points": 3.125,
    "prompt": "Choose the best answer to complete the conversation.",
    "steps": [
      "Greg เสนอให้ใช้หนังสือร่วมกัน Matt จึงขอบคุณ"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "figure": { "kind": "image", "src": q20.url, "alt": "นักเรียนใช้หนังสือร่วมกัน" },
    "promptAfter": "Matt: Oh, I didn’t bring my English book today.\nGreg: Don’t worry. We can share.\nMatt: ________",
    "type": "mcq",
    "choices": [
      {
        "text": "See you later."
      },
      {
        "text": "Nice to meet you."
      },
      {
        "text": "Sorry to hear that."
      },
      {
        "text": "Thank you very much."
      }
    ],
    "answer": 4
  },
  {
    "id": "p6-eng-2565-21",
    "no": 21,
    "topic": "การปฏิเสธอย่างสุภาพ",
    "points": 3.125,
    "prompt": "Rose: Could you help me write an essay?\nSonia: ________ I haven’t finished mine yet.",
    "steps": [
      "Sonia ยังทำของตนเองไม่เสร็จ จึงขอโทษที่ช่วยไม่ได้"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "I’m sorry."
      },
      {
        "text": "Yes, please."
      },
      {
        "text": "That’s alright."
      },
      {
        "text": "No, thank you."
      }
    ],
    "answer": 1
  },
  {
    "id": "p6-eng-2565-22",
    "no": 22,
    "topic": "บทสนทนา",
    "points": 3.125,
    "prompt": "Sophie and Zara are looking at Sophie’s family album.",
    "steps": [
      "Sophie แก้ข้อมูลว่าคนในภาพไม่ใช่ Mike แต่คือ Jerry"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "figure": { "kind": "image", "src": q22.url, "alt": "เด็กสองคนดูอัลบั้มภาพ" },
    "promptAfter": "Zara: Mike is cute.\nSophie: ________ He’s a friend of mine, Jerry.",
    "type": "mcq",
    "choices": [
      {
        "text": "I met Mike."
      },
      {
        "text": "This is not me."
      },
      {
        "text": "You know me."
      },
      {
        "text": "That’s not Mike."
      }
    ],
    "answer": 4
  },
  {
    "id": "p6-eng-2565-23",
    "no": 23,
    "topic": "การขออนุญาต",
    "points": 3.125,
    "prompt": "During the exam\nStudent: ________\nTeacher: Yes. But come right back.",
    "steps": [
      "ครูอนุญาตและกำชับให้รีบกลับ เหมาะกับการขอไปห้องน้ำ"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "Will you come with me?"
      },
      {
        "text": "May I go to the restroom?"
      },
      {
        "text": "Should I come in the room?"
      },
      {
        "text": "Would you like to go home?"
      }
    ],
    "answer": 2
  },
  {
    "id": "p6-eng-2565-24",
    "no": 24,
    "topic": "งานอดิเรก",
    "points": 3.125,
    "prompt": "Choose the best answer to complete the conversation.",
    "steps": [
      "Bob ต้องตอบแผนกิจกรรมของตนเองหลังสอบ"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "figure": { "kind": "image", "src": q24.url, "alt": "ตุ๊กตาถักสองตัว" },
    "promptAfter": "Meg: After the final exam I’m going to make a knitted doll. What about you?\nBob: ________",
    "type": "mcq",
    "choices": [
      {
        "text": "I’ll do the exam very well."
      },
      {
        "text": "I’ll work on my stamp collection."
      },
      {
        "text": "You’ll watch a hit television series."
      },
      {
        "text": "You’ll give me a gift from the north."
      }
    ],
    "answer": 2
  },
  {
    "id": "p6-eng-2565-25",
    "no": 25,
    "topic": "การให้คำแนะนำ",
    "points": 3.125,
    "prompt": "Adele: I have a headache.\nSharon: ________\nAdele: All right. I will.",
    "steps": [
      "คำแนะนำเรื่องกินยาและพักผ่อนสอดคล้องกับอาการปวดศีรษะ"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "You might go to visit your grandma."
      },
      {
        "text": "You can choose a vaccine or a mask."
      },
      {
        "text": "You would like to be a doctor or a nurse."
      },
      {
        "text": "You should take a pill and get some sleep."
      }
    ],
    "answer": 4
  },
  {
    "id": "p6-eng-2565-26",
    "no": 26,
    "topic": "ระยะเวลา",
    "points": 3.125,
    "prompt": "After the basketball match\nWilliam: You played very well. How long have you been playing?\nJames: ________",
    "steps": [
      "How long ถามระยะเวลาที่เล่น จึงตอบประมาณหนึ่งปี"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "Just for fun."
      },
      {
        "text": "I play on a team."
      },
      {
        "text": "For about a year now."
      },
      {
        "text": "I play every Saturday."
      }
    ],
    "answer": 3
  },
  {
    "id": "p6-eng-2565-27",
    "no": 27,
    "topic": "การเดินทาง",
    "points": 3.125,
    "prompt": "Liam: How can I get to your house?\nWilly: Very easy. ________ and get off at the post office. I’ll wait for you there.",
    "steps": [
      "get off ที่ไปรษณีย์สอดคล้องกับการโดยสารรถประจำทาง"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "Take bus number 12"
      },
      {
        "text": "Get a good bicycle"
      },
      {
        "text": "Ask people near here"
      },
      {
        "text": "Walk to the corner"
      }
    ],
    "answer": 1
  },
  {
    "id": "p6-eng-2565-28",
    "no": 28,
    "topic": "การขอความช่วยเหลือ",
    "points": 3.125,
    "prompt": "Choose the best answer to complete the conversation.",
    "steps": [
      "ป้าส่งข้อความไม่ได้จึงขอให้หลานช่วย"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "figure": { "kind": "image", "src": q28.url, "alt": "หลานช่วยผู้ใหญ่ใช้อุปกรณ์" },
    "promptAfter": "Aunt: I can’t send a message to my friend. ________\nNephew: Sure! It’s easy.",
    "type": "mcq",
    "choices": [
      {
        "text": "May I teach you?"
      },
      {
        "text": "It’s very kind of you."
      },
      {
        "text": "You’re very welcome."
      },
      {
        "text": "Can you help me with it?"
      }
    ],
    "answer": 4
  },
  {
    "id": "p6-eng-2565-29",
    "no": 29,
    "topic": "การแสดงความคิดเห็น",
    "points": 3.125,
    "prompt": "Siri and Ted are going to have a picnic at the park.\nSiri: What do you think? Should we bring the dog?\nTed: That’d be great! ________",
    "steps": [
      "Ted เห็นด้วยที่จะพาสุนัขไปและคิดว่ามันจะชอบที่นั่น"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "I saw them all."
      },
      {
        "text": "He’ll love it there."
      },
      {
        "text": "They are not allowed."
      },
      {
        "text": "You have never been here."
      }
    ],
    "answer": 2
  },
  {
    "id": "p6-eng-2565-30",
    "no": 30,
    "topic": "การแสดงความคิดเห็น",
    "points": 3.125,
    "prompt": "Evelyn: How was the movie last night?\nIvy: ________",
    "steps": [
      "คำตอบที่พูดถึงความรู้สึกต่อภาพยนตร์คือไม่ชอบและหลับไป"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "I didn’t read it. I told my classmates about it."
      },
      {
        "text": "I’m not funny. I told a joke to my classmates."
      },
      {
        "text": "I’m not tired. I went for a walk for 10 minutes."
      },
      {
        "text": "I didn’t like it. I fell asleep after the first 10 minutes."
      }
    ],
    "answer": 4
  },
  {
    "id": "p6-eng-2565-31",
    "no": 31,
    "topic": "สภาพอากาศ",
    "points": 3.125,
    "prompt": "Abe: Did you hear that? I heard thunder.\nYuki: Oh, no! ________",
    "steps": [
      "เสียงฟ้าร้องบ่งบอกว่าพายุกำลังมา"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "A storm is coming."
      },
      {
        "text": "It sounds like fun."
      },
      {
        "text": "The sun is setting."
      },
      {
        "text": "It must be sunny."
      }
    ],
    "answer": 1
  },
  {
    "id": "p6-eng-2565-32",
    "no": 32,
    "topic": "กิจวัตรประจำวัน",
    "points": 3.125,
    "prompt": "In the living room",
    "steps": [
      "แม่บอกว่าดึกแล้วจึงให้ปิดโทรทัศน์และเข้านอน"
    ],
    "hints": [
      "อ่านบริบทและคำถามให้ครบก่อนเลือก",
      "เปรียบเทียบความหมายและรูปประโยคของแต่ละตัวเลือก"
    ],
    "figure": { "kind": "image", "src": q32.url, "alt": "เด็กดูโทรทัศน์ในห้องนั่งเล่น" },
    "promptAfter": "Son: I’m not sleepy, Mom.\nMom: It’s very late now. ________ It’s time to sleep.",
    "type": "mcq",
    "choices": [
      {
        "text": "Switch off the light and study."
      },
      {
        "text": "Turn off the TV and go to bed."
      },
      {
        "text": "Switch on the light and exercise."
      },
      {
        "text": "Turn on the TV and do your homework."
      }
    ],
    "answer": 2
  }
],
};
