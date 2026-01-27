import { doc, getDoc, runTransaction, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const USERNAME_COLLECTION = 'usernames';

/**
 * Checks if a username is available (case-insensitive).
 * Returns true if available, false if taken.
 */
/**
 * Checks if a username is available (case-insensitive).
 * Returns true if available, false if taken.
 * If ownUid is provided, returns true if the username is taken but owned by that user.
 */
export const checkUsernameAvailability = async (username: string, ownUid?: string): Promise<boolean> => {
  if (!username) return false;
  const normalizedUsername = username.toLowerCase();
  
  // Direct ID check is fastest and cheapest
  const docRef = doc(db, USERNAME_COLLECTION, normalizedUsername);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return true;

  // If document exists, check ownership if ownUid is provided
  if (ownUid) {
      const data = docSnap.data();
      return data?.uid === ownUid;
  }

  return false;
};

/**
 * Validates username format.
 * Allowed: Alphanumeric, underscores, hyphens.
 * Length: 3-20 characters.
 */
export const validateUsername = (username: string): { valid: boolean; error?: string } => {
  if (username.length < 3) return { valid: false, error: '3文字以上で入力してください' };
  if (username.length > 20) return { valid: false, error: '20文字以内で入力してください' };
  
  const regex = /^[a-zA-Z0-9_-]+$/;
  if (!regex.test(username)) {
    return { valid: false, error: '半角英数字、ハイフン、アンダーバーのみ使用できます' };
  }
  
  return { valid: true };
};

/**
 * Claims a username for a user.
 * If the user already has a username, this handles the switch (releasing old, claiming new).
 * Uses a transaction to ensure uniqueness.
 */
export const claimUsername = async (uid: string, newUsername: string, oldUsername?: string): Promise<boolean> => {
    const normalizedNew = newUsername.toLowerCase();
    const normalizedOld = oldUsername ? oldUsername.toLowerCase() : null;

    // Check if new and old are effectively the same (e.g. case change if we allowed it, but here we normalize)
    if (normalizedNew === normalizedOld) return true; 

    try {
        await runTransaction(db, async (transaction) => {
            const newUsernameRef = doc(db, USERNAME_COLLECTION, normalizedNew);
            const newUsernameDoc = await transaction.get(newUsernameRef);

            // Check new username availability
            if (newUsernameDoc.exists()) {
                const data = newUsernameDoc.data();
                // If the username exists but is owned by the SAME user, we allow "re-claiming" (recovering from partial failure)
                if (data.uid !== uid) {
                    throw new Error("このユーザーIDは既に使用されています");
                }
            }

            // Check old username (for cleanup) - must read before write!
            let oldUsernameRef = null;
            let shouldDeleteOld = false;

            if (normalizedOld && normalizedOld !== normalizedNew) {
                oldUsernameRef = doc(db, USERNAME_COLLECTION, normalizedOld);
                const oldUsernameDoc = await transaction.get(oldUsernameRef);
                
                // Only delete if it exists and belongs to us
                if (oldUsernameDoc.exists()) {
                    const oldData = oldUsernameDoc.data();
                    if (oldData.uid === uid) {
                        shouldDeleteOld = true;
                    }
                }
            }

            // Lock the new username
            transaction.set(newUsernameRef, { uid, createdAt: new Date() });

            // Release the old username if validated
            if (shouldDeleteOld && oldUsernameRef) {
                transaction.delete(oldUsernameRef);
            }
        });
        return true;
    } catch (error) {
        console.error("Username claim failed:", error);
        throw error;
    }
};
