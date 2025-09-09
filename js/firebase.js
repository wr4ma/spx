// js/firebase.js

/**
 * Firebase module for handling real-time presence (online counter).
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getDatabase, ref, onValue, onDisconnect, set } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { firebaseConfig } from './config.js';

/**
 * Initializes Firebase and sets up the presence system to track online users.
 * Updates the 'online-count' element in the DOM.
 */
export function initializeFirebasePresence() {
    try {
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const database = getDatabase(app);
        const onlineCountEl = document.getElementById('online-count');

        const presenceRef = ref(database, 'presence');

        signInAnonymously(auth)
            .then(({ user }) => {
                const myConnectionsRef = ref(database, `presence/${user.uid}`);
                const connectedRef = ref(database, '.info/connected');

                onValue(connectedRef, (snap) => {
                    if (snap.val() === true) {
                        set(myConnectionsRef, true);
                        onDisconnect(myConnectionsRef).remove();
                    }
                });
            })
            .catch((error) => {
                console.error("Firebase anonymous sign-in failed", error);
            });

        // Listen for changes in the number of online users and update the UI.
        onValue(presenceRef, (snap) => {
            const count = snap.exists() ? snap.size : 0;
            if (onlineCountEl) {
                onlineCountEl.textContent = count;
            }
        });

    } catch (error) {
        console.error("Firebase initialization failed:", error);
        const onlineCountEl = document.getElementById('online-count');
        if (onlineCountEl) {
            onlineCountEl.textContent = 'N/A';
        }
    }
}
