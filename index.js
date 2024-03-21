import { CallClient } from "@azure/communication-calling";
import { Features } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import consts from "./devConstants";

let call;
let callAgent;
let IdDisplayName = [];
const meetingLinkInput = document.getElementById('teams-link-input');
const meetingIdInput = document.getElementById('teams-meetingId-input');
const meetingPasscodeInput = document.getElementById('teams-passcode-input');
const hangUpButton = document.getElementById('hang-up-button');
const teamsMeetingJoinButton = document.getElementById('join-meeting-button');
const callStateElement = document.getElementById('call-state');
const recordingStateElement = document.getElementById('recording-state');
const acsUserAccessToken = consts.ACS_USER_ACCESS_TOKEN;
const muteMicAndSpeakerButton = document.getElementById('mute-mic-and-speaker-button');

muteMicAndSpeakerButton.addEventListener("click", () => {
    // Mute microphone and speaker
    call.mute().then(() => {
        console.log('Microphone muted');
    });
    call.muteIncomingAudio().then(() => {
        console.log('Incoming audio muted');
    });
});

async function init() {
    const callClient = new CallClient();
    var tokenCredential;
    try {
        tokenCredential = new AzureCommunicationTokenCredential(acsUserAccessToken);
        callAgent = await callClient.createCallAgent(tokenCredential, { displayName: 'Test user' });
        teamsMeetingJoinButton.disabled = false;
    } catch (e) {
        console.error(e);
        callStateElement.innerText = e.message;
    }

}
init();

hangUpButton.addEventListener("click", async () => {
    // end the current call
    await call.hangUp();

    // toggle button states
    hangUpButton.disabled = true;
    teamsMeetingJoinButton.disabled = false;
    callStateElement.innerText = '-';
});

teamsMeetingJoinButton.addEventListener("click", () => {
    // join with meeting link
    call = callAgent.join({ meetingLink: meetingLinkInput.value }, {});

    //(or) to join with meetingId and passcode use the below code snippet.
    //call = callAgent.join({meetingId: meetingIdInput.value, passcode: meetingPasscodeInput.value}, {});

    call.on('stateChanged', () => {
        callStateElement.innerText = call.state;
    });

    // // Mute microphone and speaker
    // call.mute().then(() => {
    //     console.log('Microphone muted');
    // });
    // call.muteIncomingAudio().then(() => {
    //     console.log('Incoming audio muted');
    // });

    // Display raised hands
    const raiseHandFeature = call.feature(Features.RaiseHand);
    const raisedHandChangedHandler = (event) => {
        console.log(`Participant kind: ${event.identifier.kind} raised hand. Id: ${event.identifier.microsoftTeamsUserId}`);
        document.getElementById('raised-hands').innerText = "";
        document.getElementById('raised-hands').innerText = `Raised hands: ${raiseHandFeature.getRaisedHands().length} \n`;
        raiseHandFeature.getRaisedHands().forEach(participant => {
            console.log(participant.identifier);
            var t = IdDisplayName.filter((num) => num.key === participant.identifier.microsoftTeamsUserId);

            document.getElementById('raised-hands').innerText += t[0].value + '\n';
        });

    };
    raiseHandFeature.on('raisedHandEvent', raisedHandChangedHandler);
    raiseHandFeature.on('loweredHandEvent', raisedHandChangedHandler);

    // Display Lobby status
    const lobby = call.lobby;
    const lobbyParticipantsUpdatedHandler = (event) => {
        var lobbyParticipantsDiv = document.getElementById('in-lobby-participants');
        let lobbyParticipants = lobby.participants;
        lobbyParticipantsDiv.innerText = "";
        lobbyParticipantsDiv.innerText = `Lobby participants: ${lobbyParticipants.length} \n`;
        lobbyParticipants.forEach(participant => {
            console.log(participant.identifier);
            lobbyParticipantsDiv.innerText += participant._displayName + '\n';
        });

    };
    call.lobby.on('lobbyParticipantsUpdated', lobbyParticipantsUpdatedHandler);

    // Display in meeting participants
    const remoteParticipantsUpdatedHandler = () => {
        const participants = call.remoteParticipants;
        const inMeetingParticipants = document.getElementById('in-meeting-participants');
        inMeetingParticipants.innerHTML = "";
        inMeetingParticipants.innerHTML = `In Meeting Participants: ${participants.length} </br>`;
        participants.forEach(participant => {
            IdDisplayName.push({ key: participant.identifier.microsoftTeamsUserId, value: participant._displayName });
            inMeetingParticipants.innerHTML += `${participant._displayName} Is Muted: ${participant.isMuted} State: ${participant.state}</br>`;
        });
    };
    call.on('remoteParticipantsUpdated', remoteParticipantsUpdatedHandler);

    // toggle button states
    hangUpButton.disabled = false;
    teamsMeetingJoinButton.disabled = false;
    muteMicAndSpeakerButton.disabled = false;

    var sleep = duration => new Promise(resolve => setTimeout(resolve, duration))
    var poll = (promiseFn, duration) => promiseFn().then(
        sleep(duration).then(() => poll(promiseFn, duration)))

    poll(() => new Promise(() => remoteParticipantsUpdatedHandler()), 1000)
});






