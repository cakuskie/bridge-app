import { collection, doc, getDoc, getDocs, query, where, orderBy, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase.js'

export async function getVerifiedContractors() {
  const q = query(collection(db, 'contractors'), where('status', '==', 'active'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getContractorLeads(contractorId) {
  const q = query(collection(db, 'leads'), where('contractorId', '==', contractorId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function submitLeadRequest(contractorId, homeownerId, formData) {
  await addDoc(collection(db, 'leads'), {
    contractorId,
    homeownerId,
    ...formData,
    status: 'new',
    createdAt: serverTimestamp(),
  })
}

export async function updateLeadStatus(leadId, status) {
  await updateDoc(doc(db, 'leads', leadId), {
    status,
    updatedAt: serverTimestamp(),
  })
}
