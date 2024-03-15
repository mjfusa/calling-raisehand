import { CallClient } from "@azure/communication-calling";
import { Features } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import consts from "./devConstants";

let call;
let callAgent;
const meetingLinkInput = document.getElementById('teams-link-input');
const meetingIdInput = document.getElementById('teams-meetingId-input');
const meetingPasscodeInput = document.getElementById('teams-passcode-input');
const hangUpButton = document.getElementById('hang-up-button');
const teamsMeetingJoinButton = document.getElementById('join-meeting-button');
const callStateElement = document.getElementById('call-state');
const recordingStateElement = document.getElementById('recording-state');
const raisedHandsButton = document.getElementById('get-raised-hands-button');

const acsUserAccessToken = consts.ACS_USER_ACCESS_TOKEN;

async function init() {
    const callClient = new CallClient();
    const tokenCredential = new AzureCommunicationTokenCredential(acsUserAccessToken);
    callAgent = await callClient.createCallAgent(tokenCredential, { displayName: 'Test user' });
    teamsMeetingJoinButton.disabled = false;
}
init();

raisedHandsButton.addEventListener("click", async () => {
    const raiseHandFeature = call.feature(Features.RaiseHand);
    let participantsWithRaisedHands = raiseHandFeature.getRaisedHands();
    console.log(participantsWithRaisedHands.length + " participants have raised their hands");
    // enumerate the participants and log their ids
    if (participantsWithRaisedHands.length > 0) {
        participantsWithRaisedHands.forEach(participant => {
            console.log(participant.identifier);
        });
    }

});


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
    })


    // get the raise hand feature
    const raiseHandFeature = call.feature(Features.RaiseHand);
    raiseHandFeature.on('raisedHandChanged', (event) => {
        console.log(`Participant ${event.identifier} raised hand`);
    });


    const loweredHandChangedHandler = (event) => {
        console.log(`Participant ${event.identifier} lowered hand`);
    };
    raiseHandFeature.on('loweredHandChanged', loweredHandChangedHandler);


    // toggle button states
    hangUpButton.disabled = false;
    teamsMeetingJoinButton.disabled = false;
    raisedHandsButton.disabled = false;
});