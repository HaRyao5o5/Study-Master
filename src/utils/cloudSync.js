// src/utils/cloudSync.js
import { doc, getDoc, writeBatch, collection, getDocs } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { db, storage } from "../lib/firebase";

// ■ ヘルパー: 画像をStorageに逃がしてURLに書き換える
const processImagesInQuiz = async (uid, courseId, quizId, questions) => {
  if (!questions || !Array.isArray(questions)) return questions;
  
  const processedQuestions = await Promise.all(questions.map(async (q, qIdx) => {
    if (q.image && q.image.startsWith('data:image')) {
      try {
        const storageRef = ref(storage, `users/${uid}/courses/${courseId}/quizzes/${quizId}/q_${qIdx}`);
        const uploadResult = await uploadString(storageRef, q.image, 'data_url');
        const downloadURL = await getDownloadURL(uploadResult.ref);
        return { ...q, image: downloadURL };
      } catch (err) {
        console.error("画像アップロード失敗:", err);
        return q;
      }
    }
    return q;
  }));
  return processedQuestions;
};

export const loadFromCloud = async (uid) => {
  try {
    if (!uid) return null;
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) return null;

    const userData = userDocSnap.data();
    const courseIds = userData.courseIds || [];
    
    const coursesRef = collection(db, "users", uid, "courses");
    const coursesSnap = await getDocs(coursesRef);
    const courseMap = {};
    
    coursesSnap.forEach(doc => {
      courseMap[doc.id] = { ...doc.data(), quizzes: [] };
    });

    await Promise.all(Object.keys(courseMap).map(async (courseId) => {
      const quizzesRef = collection(db, "users", uid, "courses", courseId, "quizzes");
      const quizzesSnap = await getDocs(quizzesRef);
      quizzesSnap.forEach(qDoc => {
        courseMap[courseId].quizzes.push(qDoc.data());
      });
    }));

    const loadedCourses = courseIds
      .filter(id => courseMap[id])
      .map(id => courseMap[id]);

    return {
      userStats: userData.userStats || { totalXp: 0, level: 1, streak: 0, lastLogin: '' },
      wrongHistory: userData.wrongHistory || [],
      errorStats: userData.errorStats || {},
      courses: loadedCourses
    };
  } catch (error) {
    console.error("クラウドからの読み込みエラー:", error);
    throw error;
  }
};

export const saveToCloud = async (uid, allData, explicitTimestamp = new Date()) => {
  try {
    if (!uid) return;
    const batch = writeBatch(db);

    const userDocRef = doc(db, "users", uid);
    const validCourses = allData.courses || [];
    
    // 全てのコースに対してIDを確保し、そのリストを作る
    const courseIds = validCourses.map(c => {
      if (!c.id) c.id = `course-${Math.random().toString(36).substr(2, 9)}`;
      return c.id;
    });

    batch.set(userDocRef, {
      userStats: allData.userStats || { totalXp: 0, level: 1, streak: 0, lastLogin: '' },
      wrongHistory: allData.wrongHistory || [],
      errorStats: allData.errorStats || {},
      courseIds: courseIds,
      updatedAt: explicitTimestamp
    }, { merge: true });

    for (const course of validCourses) {
      // コースIDの確定
      const courseId = course.id;
      const { quizzes, ...courseMeta } = course;
      
      const courseRef = doc(db, "users", uid, "courses", courseId);
      batch.set(courseRef, { ...courseMeta, id: courseId });

      if (quizzes && Array.isArray(quizzes)) {
        for (const quiz of quizzes) {
          // ★ クイズIDの確定 (ここで undefined を防ぐ)
          if (!quiz.id) quiz.id = `quiz-${Math.random().toString(36).substr(2, 9)}`;
          const quizId = quiz.id;
          
          const processedQuestions = await processImagesInQuiz(uid, courseId, quizId, quiz.questions);
          
          const quizRef = doc(db, "users", uid, "courses", courseId, "quizzes", quizId);
          batch.set(quizRef, { ...quiz, id: quizId, questions: processedQuestions });
        }
      }
    }

    await batch.commit();
    console.log("クラウドへの保存（画像分離・ID補完）に成功しました！");
    return true;
  } catch (error) {
    console.error("クラウドへの保存エラー:", error);
    throw error;
  }
};

// src/utils/cloudSync.js の末尾に追加

// ★ 公開コースを取得する関数
export const fetchPublicCourse = async (targetUid, courseId) => {
  try {
    // 1. コース情報の取得
    const courseRef = doc(db, "users", targetUid, "courses", courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      throw new Error("指定されたコースが見つかりません。削除された可能性があります。");
    }

    const courseData = courseSnap.data();

    // 2. アクセス権限のチェック
    // 'private' ならエラーにする（Firestoreのルールでも弾くべきだが、念のため）
    if (courseData.visibility === 'private') {
      throw new Error("このコースは非公開に設定されています。");
    }

    // 3. クイズ（サブコレクション）の取得
    const quizzesRef = collection(db, "users", targetUid, "courses", courseId, "quizzes");
    const quizzesSnap = await getDocs(quizzesRef);
    const quizzes = [];
    quizzesSnap.forEach(doc => {
      quizzes.push(doc.data());
    });

    // コース情報とクイズを合体させて返す
    return { ...courseData, quizzes };

  } catch (error) {
    console.error("Error fetching public course:", error);
    throw error;
  }
};