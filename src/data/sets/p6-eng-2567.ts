import type { Exam } from "../exam-types";
import q22 from "@/assets/exam/p6-eng-2567-q22.jpg.asset.json";
import q23 from "@/assets/exam/p6-eng-2567-q23.jpg.asset.json";
import q24 from "@/assets/exam/p6-eng-2567-q24.jpg.asset.json";
import q25 from "@/assets/exam/p6-eng-2567-q25.jpg.asset.json";
import q26 from "@/assets/exam/p6-eng-2567-q26.jpg.asset.json";
import q27 from "@/assets/exam/p6-eng-2567-q27.jpg.asset.json";
import q28 from "@/assets/exam/p6-eng-2567-q28.jpg.asset.json";
import q29 from "@/assets/exam/p6-eng-2567-q29.jpg.asset.json";
import q30 from "@/assets/exam/p6-eng-2567-q30.jpg.asset.json";

export const exam: Exam = {
  level: "p6",
  subject: "eng",
  year: 2567,
  title: "O-NET ภาษาอังกฤษ ป.6",
  code: "รหัสวิชา 63 · ชุด 100",
  examDate: "สอบ 3 กุมภาพันธ์ 2568 (ปีการศึกษา 2567)",
  minutes: 60,
  questions: [
  {
    "id": "p6-eng-2567-1",
    "no": 1,
    "topic": "Conversation",
    "points": 3.125,
    "prompt": "Student: Could you please explain this math question again?\nTeacher: _____ I'm in a hurry. Can you see me at 11?",
    "steps": [
      "ครูกำลังรีบ จึงต้องปฏิเสธอย่างสุภาพด้วย \"Sorry.\""
    ],
    "hints": [
      "ครูตอบตกลงหรือปฏิเสธ",
      "ประโยคต่อมาบอกว่าครูกำลังรีบ"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "Sure!"
      },
      {
        "text": "Sorry."
      },
      {
        "text": "That's right!"
      },
      {
        "text": "Please wait here."
      }
    ],
    "answer": 2
  },
  {
    "id": "p6-eng-2567-2",
    "no": 2,
    "topic": "Conversation",
    "points": 3.125,
    "prompt": "Teacher: Thank you for helping me carry these books.\nStudent: ______.",
    "steps": [
      "ตอบรับคำขอบคุณด้วย \"You're welcome\""
    ],
    "hints": [
      "เมื่อมีคนพูด Thank you เราตอบว่าอะไร"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "That's all"
      },
      {
        "text": "It's my duty"
      },
      {
        "text": "I don't know"
      },
      {
        "text": "You're welcome"
      }
    ],
    "answer": 4
  },
  {
    "id": "p6-eng-2567-3",
    "no": 3,
    "topic": "Conversation",
    "points": 3.125,
    "prompt": "Jane: How long is the flight?\nJack: ______.",
    "steps": [
      "How long ถามระยะเวลาของเที่ยวบิน ตอบเป็นชั่วโมง"
    ],
    "hints": [
      "How long ในที่นี้ถามความยาวของอะไร",
      "เที่ยวบินวัดเป็นเวลา"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "Three hours"
      },
      {
        "text": "Three times"
      },
      {
        "text": "Three floors"
      },
      {
        "text": "Three meters"
      }
    ],
    "answer": 1
  },
  {
    "id": "p6-eng-2567-4",
    "no": 4,
    "topic": "Conversation",
    "points": 3.125,
    "prompt": "Mint: I have to return these books and go to class.\nBeam: ______",
    "steps": [
      "Mint กำลังจะไป จึงบอกลาด้วย \"See you later!\""
    ],
    "hints": [
      "Mint กำลังจะทำอะไร",
      "เราพูดอะไรเมื่อเพื่อนกำลังจะแยกไป"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "Thank you."
      },
      {
        "text": "See you later!"
      },
      {
        "text": "How are you?"
      },
      {
        "text": "Good morning."
      }
    ],
    "answer": 2
  },
  {
    "id": "p6-eng-2567-5",
    "no": 5,
    "topic": "Conversation",
    "points": 3.125,
    "prompt": "A: The room is so dark. ______.\nB: Okay, I'll do it right away.",
    "steps": [
      "B ตอบว่า \"I'll do it\" แสดงว่า A ขอให้ทำบางอย่าง = เปิดไฟ"
    ],
    "hints": [
      "B ตอบรับคำขอร้อง",
      "ประโยคใดเป็นการขอให้ทำ"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "I can't see anything"
      },
      {
        "text": "It is dark outside too"
      },
      {
        "text": "Please turn on the light"
      },
      {
        "text": "The light switch is broken"
      }
    ],
    "answer": 3
  },
  {
    "id": "p6-eng-2567-6",
    "no": 6,
    "topic": "Conversation",
    "points": 3.125,
    "prompt": "Frank is asking Mali a riddle.\nFrank: I have \"hands and a face, but can't hold anything or smile.\" What am I?\nMali: ______.",
    "steps": [
      "นาฬิกามีเข็ม (hands) และหน้าปัด (face)"
    ],
    "hints": [
      "สิ่งของใดมี hands และ face",
      "ลองนึกถึงสิ่งที่บอกเวลา"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "A table"
      },
      {
        "text": "A clock"
      },
      {
        "text": "A house"
      },
      {
        "text": "A mountain"
      }
    ],
    "answer": 2
  },
  {
    "id": "p6-eng-2567-7",
    "no": 7,
    "topic": "Conversation",
    "points": 3.125,
    "prompt": "Jeff, an exchange student from New Zealand, comes to school for the first day. Before class, he meets Joy in the hallway.\nJeff: Hello, my name is Jeff. I come from New Zealand.\nJoy: Hi, my name is Joy. ______",
    "steps": [
      "เจอกันครั้งแรกหลังแนะนำตัว พูดว่า \"Nice to meet you.\""
    ],
    "hints": [
      "ทั้งสองเพิ่งรู้จักกันครั้งแรก"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "Nice to meet you."
      },
      {
        "text": "What about you?"
      },
      {
        "text": "Thanks for asking me."
      },
      {
        "text": "Do you come to school?"
      }
    ],
    "answer": 1
  },
  {
    "id": "p6-eng-2567-8",
    "no": 8,
    "topic": "Conversation",
    "points": 3.125,
    "prompt": "A: I am really thirsty. ______\nB: Sure, here you go!",
    "steps": [
      "B ยื่นให้ (here you go) แสดงว่า A ขอน้ำ"
    ],
    "hints": [
      "คนที่กระหายน้ำต้องการอะไร",
      "B ตอบว่า Sure แปลว่าตอบรับคำขอ"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "I need some water."
      },
      {
        "text": "The water is so cold."
      },
      {
        "text": "Thank you for water."
      },
      {
        "text": "Do you need a glass of water?"
      }
    ],
    "answer": 1
  },
  {
    "id": "p6-eng-2567-9",
    "no": 9,
    "topic": "Conversation",
    "points": 3.125,
    "prompt": "Sara and Ben are friends.\nSara: It's so hot today.\nBen: Yes. You know what would be perfect right now?\nSara: Ice cream! ______.",
    "steps": [
      "อยากกินไอศกรีม จึงชวนไปร้านใกล้ ๆ"
    ],
    "hints": [
      "Sara อยากได้อะไร",
      "ต้องไปที่ไหนจึงจะได้ไอศกรีม"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "We should go ice skating"
      },
      {
        "text": "I heard there's a new movie playing"
      },
      {
        "text": "I think there's a swimming pool there"
      },
      {
        "text": "Let's go to that shop around the corner"
      }
    ],
    "answer": 4
  },
  {
    "id": "p6-eng-2567-10",
    "no": 10,
    "topic": "Conversation",
    "points": 3.125,
    "prompt": "A: ______?\nB: He has grown a lot since last year. I used to be taller!",
    "steps": [
      "B เล่าความเป็นไปของน้องชาย ตอบคำถาม \"How is your brother doing?\""
    ],
    "hints": [
      "คำตอบพูดถึงใคร และพูดเรื่องอะไร"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "How is your brother doing"
      },
      {
        "text": "What did your brother grow"
      },
      {
        "text": "Does your brother play basketball often"
      },
      {
        "text": "Didn't your brother use to have short hair"
      }
    ],
    "answer": 1
  },
  {
    "id": "p6-eng-2567-11",
    "no": 11,
    "topic": "Conversation",
    "points": 3.125,
    "prompt": "After a math class\nStudent: ______\nTeacher: I agree. I'll give you more examples tomorrow.",
    "steps": [
      "ครูเห็นด้วยและจะให้ตัวอย่างเพิ่ม แสดงว่านักเรียนบอกว่าบทเรียนยาก"
    ],
    "hints": [
      "ทำไมครูจะให้ตัวอย่างเพิ่ม"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "That was hard!"
      },
      {
        "text": "It's a terrible day!"
      },
      {
        "text": "Lunch was good today."
      },
      {
        "text": "You're such a good teacher."
      }
    ],
    "answer": 1
  },
  {
    "id": "p6-eng-2567-12",
    "no": 12,
    "topic": "Conversation",
    "points": 3.125,
    "prompt": "In class\nTeacher: Does anyone have any questions about the lesson today?\nSam: Yes, I do. ______? I'm sorry I forgot.\nTeacher: It's ok. You need to hand in your work by 3:30 this Friday.\nSam: Thank you very much.",
    "steps": [
      "ครูตอบเวลาส่งงาน = ถามกำหนดส่ง (deadline)"
    ],
    "hints": [
      "คำตอบของครูบอกข้อมูลอะไร",
      "hand in your work by ... หมายถึงอะไร"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "Who should I work with"
      },
      {
        "text": "Which exercises do I have to do"
      },
      {
        "text": "What time will the class start on Friday"
      },
      {
        "text": "When is the deadline for the homework"
      }
    ],
    "answer": 4
  },
  {
    "id": "p6-eng-2567-13",
    "no": 13,
    "topic": "Conversation",
    "points": 3.125,
    "prompt": "At the canteen\nJess: I'm very hungry.\nBob: Me too. ______?\nJess: I don't know. Let's see what they have.\nBob: Good idea!",
    "steps": [
      "Jess ตอบว่าไม่รู้ ขอดูก่อนว่ามีอะไร = ถามว่าอยากกินอะไร"
    ],
    "hints": [
      "\"Let's see what they have\" ตอบคำถามแบบใด"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "Who should we wait for"
      },
      {
        "text": "When will we come back"
      },
      {
        "text": "What do you feel like eating"
      },
      {
        "text": "Where can we wash our hands"
      }
    ],
    "answer": 3
  },
  {
    "id": "p6-eng-2567-14",
    "no": 14,
    "topic": "Conversation",
    "points": 3.125,
    "prompt": "Pim: I am getting hot chocolate. Would you like some?\nTom: Can I have Coca Cola?\nPim: There are no sodas at this shop.\nTom: I think I will have the same then.\nWhat does Tom decide to drink?",
    "steps": [
      "\"the same\" = เหมือน Pim คือ hot chocolate"
    ],
    "hints": [
      "the same หมายถึงเหมือนใคร",
      "Pim กำลังซื้ออะไร"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "Soda"
      },
      {
        "text": "Water"
      },
      {
        "text": "Coca Cola"
      },
      {
        "text": "Hot chocolate"
      }
    ],
    "answer": 4
  },
  {
    "id": "p6-eng-2567-15",
    "no": 15,
    "topic": "Conversation",
    "points": 3.125,
    "prompt": "Susan: Do you mind if I sit here?\nJenny: Of course not. Please do.\nWhat does Jenny mean?",
    "steps": [
      "Do you mind ...? ตอบ \"Of course not\" = ไม่ว่าอะไร เชิญเลย"
    ],
    "hints": [
      "Do you mind แปลว่า รังเกียจไหม",
      "ตอบ not = ไม่รังเกียจ"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "She wants Susan to leave."
      },
      {
        "text": "She doesn't want Susan to sit there."
      },
      {
        "text": "She doesn't mind if Susan sits there."
      },
      {
        "text": "She will save the seat for Susan."
      }
    ],
    "answer": 3
  },
  {
    "id": "p6-eng-2567-16",
    "no": 16,
    "topic": "Reading",
    "points": 3.125,
    "prompt": "Lisa went to a fruit market. She bought apples, oranges, and bananas to make a fruit salad to go with dinner.\nWhich sentence is CORRECT?",
    "steps": [
      "สลัดผลไม้ที่ทานคู่กับมื้อเย็น = เครื่องเคียง (side dish)"
    ],
    "hints": [
      "Lisa ซื้อผลไม้ไปทำอะไร",
      "to go with dinner หมายความว่าอย่างไร"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "Lisa planned to make a side dish for dinner."
      },
      {
        "text": "Lisa bought vegetables to make a salad."
      },
      {
        "text": "Lisa did not buy anything at the market."
      },
      {
        "text": "Lisa went to the fruit market to buy fruit for a cake."
      }
    ],
    "answer": 1
  },
  {
    "id": "p6-eng-2567-17",
    "no": 17,
    "topic": "Reading",
    "points": 3.125,
    "prompt": "Nid is an exchange student in the US. She is talking to her classmate, Susan.\nNid: What is Easter?\nSusan: Easter is a special holiday when Christians celebrate the second coming of Jesus Christ. We go to church, sing to God, and spend a lovely evening with our family.\nAccording to Susan, Easter is a holiday mainly about ______.",
    "steps": [
      "Christians, Jesus Christ, church, God เกี่ยวกับศาสนา"
    ],
    "hints": [
      "คำสำคัญในคำตอบของ Susan คืออะไร"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "food"
      },
      {
        "text": "friends"
      },
      {
        "text": "history"
      },
      {
        "text": "religion"
      }
    ],
    "answer": 4
  },
  {
    "id": "p6-eng-2567-18",
    "no": 18,
    "topic": "Conversation",
    "points": 3.125,
    "prompt": "Jenny forgot her pencil case at home.\nJenny: Teacher, may I borrow one of your pencils please?\nTeacher: Of course. Take your choice.\nWhat does Teacher mean?",
    "steps": [
      "\"Of course. Take your choice.\" = ได้เลย เลือกเอาได้"
    ],
    "hints": [
      "Of course แปลว่าอนุญาตหรือไม่"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "Jenny can take the course."
      },
      {
        "text": "Jenny can borrow a pencil."
      },
      {
        "text": "Jenny cannot have a pencil."
      },
      {
        "text": "Jenny cannot decide which one to take."
      }
    ],
    "answer": 2
  },
  {
    "id": "p6-eng-2567-19",
    "no": 19,
    "topic": "Pronunciation",
    "points": 3.125,
    "prompt": "Which word has a different vowel sound from \"book\"?",
    "steps": [
      "book, foot, took, good ออกเสียงสระ /ʊ/",
      "door ออกเสียง /ɔː/"
    ],
    "hints": [
      "ลองออกเสียงแต่ละคำเทียบกับ book",
      "oo ใน door ออกเสียงเหมือนคำอื่นไหม"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "Foot"
      },
      {
        "text": "Door"
      },
      {
        "text": "Took"
      },
      {
        "text": "Good"
      }
    ],
    "answer": 2
  },
  {
    "id": "p6-eng-2567-20",
    "no": 20,
    "topic": "Intonation",
    "points": 3.125,
    "prompt": "Which sentence has a different intonation?",
    "steps": [
      "คำถาม Yes/No (Can I...?) ใช้เสียงขึ้นท้ายประโยค",
      "คำถาม Wh- ใช้เสียงลงท้ายประโยค"
    ],
    "hints": [
      "ประโยคใดตอบด้วย Yes/No ได้",
      "คำถาม Wh- กับคำถาม Yes/No ลงเสียงต่างกัน"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "How do you go to school?"
      },
      {
        "text": "What time is the meeting?"
      },
      {
        "text": "Can I borrow your pencil?"
      },
      {
        "text": "When will Jackson leave?"
      }
    ],
    "answer": 3
  },
  {
    "id": "p6-eng-2567-21",
    "no": 21,
    "topic": "Punctuation",
    "points": 3.125,
    "prompt": "Which of the following sentences uses CORRECT punctuation?",
    "steps": [
      "ข้อ 1 ต้องลงท้ายด้วย ? ข้อ 2 ควรใช้ , ก่อน so ข้อ 4 ไม่ใช้ ; หลัง such as"
    ],
    "hints": [
      "ประโยคคำถามท้ายประโยค (tag question) ต้องลงท้ายด้วยเครื่องหมายใด",
      "such as ตามด้วยเครื่องหมายอะไรหรือไม่"
    ],
    "type": "mcq",
    "choices": [
      {
        "text": "You are going to Singapore next week, aren't you."
      },
      {
        "text": "I was late this morning: so my teacher was not very happy."
      },
      {
        "text": "I have two comic books at home, Doraemon and the Little Mermaid."
      },
      {
        "text": "My friends enjoy different sports such as; football, tennis and basketball."
      }
    ],
    "answer": 3
  },
  {
    "id": "p6-eng-2567-22",
    "no": 22,
    "topic": "Signs",
    "points": 3.125,
    "prompt": "Look at the sign.\nWhere are you most likely to see this sign?",
    "steps": [
      "ป้าย DO NOT DISTURB แขวนที่ลูกบิดประตูห้องพักโรงแรม"
    ],
    "hints": [
      "ป้ายมีรูปเตียงและห่วงสำหรับแขวน",
      "ป้ายนี้แขวนไว้ที่ใด"
    ],
    "figure": { "kind": "image", "src": q22.url, "alt": "ป้ายแขวนประตู DO NOT DISTURB รูปเตียง" },
    "type": "mcq",
    "choices": [
      {
        "text": "At a restaurant"
      },
      {
        "text": "On a school wall"
      },
      {
        "text": "On a hotel room door"
      },
      {
        "text": "At the side of the road"
      }
    ],
    "answer": 3
  },
  {
    "id": "p6-eng-2567-23",
    "no": 23,
    "topic": "Pictures",
    "points": 3.125,
    "prompt": "Look at the picture.\nWhere can we buy these items?",
    "steps": [
      "ภาพเป็นขวดยาและแผงยา ซื้อได้ที่ร้านขายยา (drugstore)"
    ],
    "hints": [
      "ของในภาพคืออะไร"
    ],
    "figure": { "kind": "image", "src": q23.url, "alt": "ขวดยาและแผงยาหลายชนิด" },
    "type": "mcq",
    "choices": [
      {
        "text": "At a hotel"
      },
      {
        "text": "At the library"
      },
      {
        "text": "At the museum"
      },
      {
        "text": "At a drugstore"
      }
    ],
    "answer": 4
  },
  {
    "id": "p6-eng-2567-24",
    "no": 24,
    "topic": "Signs",
    "points": 3.125,
    "prompt": "Look at the sign.\nWhen you see this sign, what should you do?",
    "steps": [
      "ป้ายคนเดินบนทางม้าลาย = ข้ามถนนตรงนี้"
    ],
    "hints": [
      "ในป้ายมีคนกำลังเดินบนอะไร"
    ],
    "figure": { "kind": "image", "src": q24.url, "alt": "ป้ายรูปคนเดินบนทางม้าลาย" },
    "type": "mcq",
    "choices": [
      {
        "text": "Cross the street here."
      },
      {
        "text": "Wait for the train here."
      },
      {
        "text": "Go over the footbridge."
      },
      {
        "text": "Walk only on the black lines."
      }
    ],
    "answer": 1
  },
  {
    "id": "p6-eng-2567-25",
    "no": 25,
    "topic": "Reading",
    "points": 3.125,
    "prompt": "A triangle is next to a square and under a circle.\nFrom this sentence, which picture is CORRECT?",
    "steps": [
      "สามเหลี่ยมอยู่ข้างสี่เหลี่ยม (next to) และอยู่ใต้วงกลม (under) = ภาพ 4"
    ],
    "hints": [
      "next to = ข้าง ๆ, under = ข้างใต้",
      "สามเหลี่ยมต้องอยู่ใต้รูปใด"
    ],
    "figure": { "kind": "image", "src": q25.url, "alt": "ภาพรูปทรง 4 แบบ" },
    "type": "mcq",
    "choices": [
      {
        "text": "ภาพ 1"
      },
      {
        "text": "ภาพ 2"
      },
      {
        "text": "ภาพ 3"
      },
      {
        "text": "ภาพ 4"
      }
    ],
    "answer": 4
  },
  {
    "id": "p6-eng-2567-26",
    "no": 26,
    "topic": "Reading",
    "points": 3.125,
    "prompt": "Bears don't live as long as lions. Horses live longer than lions. Elephants live the longest.\nWhich graph is CORRECT?",
    "steps": [
      "เรียงอายุจากน้อยไปมาก: หมี < สิงโต < ม้า < ช้าง = กราฟ 1"
    ],
    "hints": [
      "หมีอายุสั้นกว่าหรือยาวกว่าสิงโต",
      "เรียงสัตว์ตามอายุจากสั้นไปยาว"
    ],
    "figure": { "kind": "image", "src": q26.url, "alt": "กราฟแท่งอายุสัตว์ 4 แบบ" },
    "type": "mcq",
    "choices": [
      {
        "text": "กราฟ 1"
      },
      {
        "text": "กราฟ 2"
      },
      {
        "text": "กราฟ 3"
      },
      {
        "text": "กราฟ 4"
      }
    ],
    "answer": 1
  },
  {
    "id": "p6-eng-2567-27",
    "no": 27,
    "topic": "Directions",
    "points": 3.125,
    "prompt": "Tom wants to go to the ice cream shop. He asks for directions, and a policeman tells him, \"Go straight, and turn right at the second corner.\"\nWhich map is CORRECT?",
    "steps": [
      "เดินตรงไปผ่านแยกแรก แล้วเลี้ยวขวาที่แยกที่สอง = แผนที่ 3"
    ],
    "hints": [
      "turn right = เลี้ยวขวา",
      "second corner = หัวมุมที่สอง"
    ],
    "figure": { "kind": "image", "src": q27.url, "alt": "แผนที่เส้นทาง 4 แบบ" },
    "type": "mcq",
    "choices": [
      {
        "text": "แผนที่ 1"
      },
      {
        "text": "แผนที่ 2"
      },
      {
        "text": "แผนที่ 3"
      },
      {
        "text": "แผนที่ 4"
      }
    ],
    "answer": 3
  },
  {
    "id": "p6-eng-2567-28",
    "no": 28,
    "topic": "Reading",
    "points": 3.125,
    "prompt": "Look at the weather forecast.\nAccording to the forecast, which sentence is CORRECT?",
    "steps": [
      "วันอาทิตย์มีแดด 25° เหมาะไปทะเล"
    ],
    "hints": [
      "อ่านสัญลักษณ์อากาศและอุณหภูมิแต่ละวัน",
      "วันใดมีแดด"
    ],
    "figure": { "kind": "image", "src": q28.url, "alt": "พยากรณ์อากาศ 7 วัน Sunday–Saturday" },
    "type": "mcq",
    "choices": [
      {
        "text": "We can go skiing on Tuesday."
      },
      {
        "text": "The weather will be hot on Friday."
      },
      {
        "text": "We can go to the beach on Sunday."
      },
      {
        "text": "There will be heavy rain on Monday."
      }
    ],
    "answer": 3
  },
  {
    "id": "p6-eng-2567-29",
    "no": 29,
    "topic": "Reading",
    "points": 3.125,
    "prompt": "Look at the notice.\nWhat will customers do if they want to get a discount?",
    "steps": [
      "\"when you present this coupon\" = แสดงคูปองนี้"
    ],
    "hints": [
      "present ในที่นี้แปลว่าอะไร"
    ],
    "figure": { "kind": "image", "src": q29.url, "alt": "คูปองลด 25% ผัดไทย" },
    "type": "mcq",
    "choices": [
      {
        "text": "Show this coupon"
      },
      {
        "text": "Eat in the restaurant"
      },
      {
        "text": "Pay the normal price"
      },
      {
        "text": "Spend more than 25%"
      }
    ],
    "answer": 1
  },
  {
    "id": "p6-eng-2567-30",
    "no": 30,
    "topic": "Pictures",
    "points": 3.125,
    "prompt": "Look at the picture.\nWhy are they at the beach?",
    "steps": [
      "ในภาพทุกคนกำลังเก็บขยะใส่ถุง = ทำความสะอาดชายหาด"
    ],
    "hints": [
      "คนในภาพถือถุงอะไร กำลังทำอะไร"
    ],
    "figure": { "kind": "image", "src": q30.url, "alt": "ครอบครัวเก็บขยะบนชายหาด" },
    "type": "mcq",
    "choices": [
      {
        "text": "To make it cleaner"
      },
      {
        "text": "To play in the sand"
      },
      {
        "text": "To look for turtle eggs"
      },
      {
        "text": "To find some seashells"
      }
    ],
    "answer": 1
  },
  {
    "id": "p6-eng-2567-31",
    "no": 31,
    "topic": "Reading",
    "points": 3.125,
    "prompt": "According to the passage, which sentence is NOT correct?",
    "steps": [
      "เนื้อเรื่องบอกว่าชาวตะวันตกไม่นิยมแบ่งอาหาร ไม่ได้บอกว่าแบ่งเฉพาะเพื่อนสนิท"
    ],
    "hints": [
      "หาข้อที่เนื้อเรื่องไม่ได้กล่าวไว้"
    ],
    "passage": "Passage 1\nSharing dishes is common in Asian food culture. Thai people love sharing dishes with friends and family. It is an important part of the dining experience. However, sharing dishes is not usual in Western countries such as the US. Most Americans believe eating is a private matter and it is not clean to share dishes with other people.",
    "type": "mcq",
    "choices": [
      {
        "text": "Food sharing is more common in Asia."
      },
      {
        "text": "Sharing dishes may not be okay in some cultures."
      },
      {
        "text": "In Thailand, people see food sharing as important."
      },
      {
        "text": "Western people only share dishes with close friends."
      }
    ],
    "answer": 4
  },
  {
    "id": "p6-eng-2567-32",
    "no": 32,
    "topic": "Reading",
    "points": 3.125,
    "prompt": "According to the text, Thanksgiving Day is celebrated ______.",
    "steps": [
      "\"give thanks for the good things in their lives\" = ขอบคุณสิ่งดี ๆ (blessings)"
    ],
    "hints": [
      "แคนาดาก็มีวันนี้ด้วยหรือไม่",
      "fourth Thursday ตรงกับวันที่เดิมทุกปีไหม"
    ],
    "passage": "Passage 2\nIn the US, Thanksgiving Day is a public holiday. It is celebrated on the fourth Thursday in November. On this day, Americans give thanks for the good things in their lives. Families enjoy a traditional Thanksgiving meal of roast turkey, sweet potatoes, and pumpkin pie with their friends and loved ones. Canadians also celebrate Thanksgiving, but on the second Monday in October.",
    "type": "mcq",
    "choices": [
      {
        "text": "only in America"
      },
      {
        "text": "four times a year"
      },
      {
        "text": "to give thanks for blessings"
      },
      {
        "text": "on November 24 every year"
      }
    ],
    "answer": 3
  }
],
};
