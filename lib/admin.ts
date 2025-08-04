import { doc, getDoc } from "firebase/firestore"
import { db } from "./firebase"

// Lista de emails de administradores
const ADMIN_EMAILS = [
  "nachos@gmail.com", // Agrega aquí tu email real
  "admin@sushi-counter.com"
]

export const isAdmin = async (userEmail: string | null): Promise<boolean> => {
  if (!userEmail) return false
  
  // Verificar si el email está en la lista de administradores
  if (ADMIN_EMAILS.includes(userEmail)) {
    return true
  }
  
  // También verificar en Firestore si el usuario tiene rol de admin
  try {
    const userDoc = await getDoc(doc(db, "users", userEmail))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      return userData.role === "admin" || userData.isAdmin === true
    }
  } catch (error) {
    console.error("Error checking admin status:", error)
  }
  
  return false
}

export const setUserAsAdmin = async (userEmail: string): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", userEmail)
    await userRef.set({
      email: userEmail,
      role: "admin",
      isAdmin: true,
      updatedAt: new Date()
    }, { merge: true })
    return true
  } catch (error) {
    console.error("Error setting user as admin:", error)
    return false
  }
} 