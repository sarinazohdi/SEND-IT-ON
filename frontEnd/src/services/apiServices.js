import firebase from "firebase";
import firebaseApp from '@/firebaseConfig';
import dayjs from 'dayjs';
import durationPlugin from 'dayjs/plugin/duration';
dayjs.extend(durationPlugin);

const db = firebaseApp.firestore();

export async function getResources() {
  const resourceRef = db.collection('resources');
  const querySnapshot = await resourceRef.get();
  return querySnapshot.docs.map(resourceDoc => resourceDoc.data());
}

export async function deleteResource(resource) {
  // If the resource was a file, have to delete from firebase storage as well
  if (resource.isFile) {
    await firebase.storage().ref(resource.name).delete();
  }
  await db.collection('resources').doc(resource.name).delete();
}

export async function updateResources(name, link, isFile = false) {
  db.collection('resources').doc(name).set({
    name,
    link,
    isFile,
    date: new Date().toLocaleDateString("en-ca")
  }).catch((error) => {
    throw error;
  });
}

export async function getVolunteering(id) {
  try {
    const volunteeringDoc = await db.collection('users').doc(id).collection("volunteering").get();
    if (volunteeringDoc.docs.length === 0) {
      return [];
    }
    return volunteeringDoc.docs.map(doc => doc.data());
  } catch (error) {
    console.log(error)
    return new Error(`Could not get volunteering information for user: ${id}.`);
  }

}

export async function updateVolunteering(id, event, timeVolunteered, description) {
  try {
    await db.collection('users').doc(id).collection("volunteering").add({
      event,
      timeVolunteered,
      description,
      timeStamp: dayjs().toISOString()
    });
  } catch (error) {
    console.log(error)
      return new Error(`Could not update volunteering information for user: ${id}.`);
    }
}

export async function deleteVolunteering(id, timeStamp) {
  try {
    let volunteeringSnapshot = await db.collection('users').doc(id).collection("volunteering").where("timeStamp", "==", timeStamp).get();
    volunteeringSnapshot.forEach(async doc => await doc.ref.delete());
  } catch (error) {
    console.log(error)
      return new Error(`Could not delete volunteering information for user: ${id}.`);
    }
}

export async function uploadFile(name, data) {
  return await firebase
    .storage()
    .ref(name)
    .put(data);
}

export async function getUserById(id) {
  const userRef = db.collection('users').doc(id);
  const userDoc = await userRef.get();
  if (userDoc.exists) {
    return userDoc.data();
  } else {
    return new Error(`User with id: ${id}.`);
  }
}

// get user from firebase by email
export async function getUserByEmail(email) {
  const userRef = db.collection('users').where("email", "==", email)
  const querySnapshot = await userRef.get();
  const firstResult = querySnapshot.docs[0];
  if (firstResult) {
    return { ...firstResult.data(), id: firstResult.id };
  }
  return null;
}

// get user from localstorage by email. if it's not there, check firebase and set it locally.
export async function getUserByEmailFromFirebaseAndSetLocally(email) {
  const user = await getUserByEmail(email);
  localStorage.setItem(email, JSON.stringify(user));
  return user;
}

// gets user object from local storage, and if it's not there, gets it from firebase and sets it
export async function getUserByEmailLocally(email) {
  const localUser = localStorage.getItem(email);
  if (!localUser) {
    return await getUserByEmailFromFirebaseAndSetLocally(email);
  }
  return JSON.parse(localUser);
}

// get currently signed in user's data from local storage or firebase
export async function getSignedInUserObj() {
  const currentUser = await firebaseApp.getCurrentUser();
  const currentUserEmail = currentUser.email;
  return await getUserByEmailLocally(currentUserEmail);
}

export function clearLocalUser(email) {
  localStorage.removeItem(email);
}

export async function createUser(uid, email, firstname, lastname, country) {
  db.collection('users').doc(uid).set({
    email,
    firstname,
    lastname,
    country,
    hours: 0,
    signupDate: firebase.firestore.FieldValue.serverTimestamp(),
    isAdmin: false,
  }).catch((error) => {
    throw error;
  });
}

export async function signup(email, password, firstname, lastname, country) {
  const existingUser = await getUserByEmail(email);
  console.log(existingUser);
  if (existingUser) {
    throw new Error(`Failed to signup with email: ${email}. An account with this email already exists!`);
  }

  try {
    const auth = firebaseApp.auth();
    await auth.createUserWithEmailAndPassword(email, password);
    const user = auth.currentUser;
    await createUser(user.uid, email, firstname, lastname, country);
    await user.sendEmailVerification();
  } catch (error) {
    throw new Error(`Failed to signup with email: ${email}. ${error}`);
  }
}

export async function signin(email, password) {
  const auth = firebaseApp.auth();
  await auth.signInWithEmailAndPassword(email, password);
  const { currentUser } = auth;
  return await getUserByEmailFromFirebaseAndSetLocally(currentUser.email);
}

export async function signout() {
  const currentUser = await getSignedInUserObj();
  await firebaseApp.auth().signOut();
  await clearLocalUser(currentUser.email);
}

export async function getAllAdmins() {
  const adminsRef = db.collection('users').where("isAdmin", "==", true)
  const querySnapshot = await adminsRef.get();
  return querySnapshot.docs.map(userDoc => userDoc.data());
}

export async function getAllNonAdmins() {
  const adminsRef = db.collection('users').where("isAdmin", "==", false)
  const querySnapshot = await adminsRef.get();
  return querySnapshot.docs.map(userDoc => userDoc.data());
}

export async function getAllComputersFromFirestore() {
  const computersRef = db.collection('computers');
  const querySnapshot = await computersRef.get();
  return querySnapshot.docs.map(computerDoc => computerDoc.data());
}

// startDate and endDate are dayjs() objects
export async function getFreeBusyBetween(startDatetime, endDatetime, timeZone, calendarId, apiKey) {
  const dateTimeFormat = 'YYYY-MM-DDTHH:mm:ssZ';
  const body = {
    timeMin: startDatetime.format(dateTimeFormat),
    timeMax: endDatetime.format(dateTimeFormat),
    timeZone,
    items: [{
      id: calendarId
    }]
  }
  const response = await fetch(`https://www.googleapis.com/calendar/v3/freeBusy?&key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (data.calendars[calendarId].errors) {
    throw new Error(data.calendars[calendarId].errors[0]);
  }
  return data.calendars[calendarId].busy;
}

export async function bookComputer(startDatetime, endDatetime, computerCalendarId, pizzly, pizzlyAuthId) {
  const body = {
    start: {
      dateTime: startDatetime.toISOString()
    },
    end: {
      dateTime: endDatetime.toISOString()
    },
    attendees: [
      {
        email: computerCalendarId,
        responseStatus: 'accepted',
      }
    ],
    source: {
      title: 'SEND IT ON Web App',
      url: 'https://send-it-on.com/'
    },
    summary: 'Computer Booking',
  };
  const res = await pizzly
                .integration('google-calendar')
                .auth(pizzlyAuthId)
                .post('/calendars/primary/events', {
                  'Content-Type': 'application/json',
                  body: JSON.stringify(body)
                });
  const data = await res.json();
  return data;
}