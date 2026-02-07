export interface Chat {
  id: string;
  profilePicture: string;
}

export interface Sender {
  id: string;
  senderLid: string;
  profilePicture: string;
  pushName: string;
  verifiedBizName: string;
}

export interface SenderKeyDistributionMessage {
  groupId: string;
  axolotlSenderKeyDistributionMessage: string;
}

export interface DisappearingMode {
  initiator: string;
  trigger: string;
  initiatedByMe: boolean;
}

export interface ContextInfo {
  mentionedJid: string[];
  participant: string;
  disappearingMode: DisappearingMode;
}

export interface ExtendedTextMessage {
  text: string;
  contextInfo: ContextInfo;
  inviteLinkGroupTypeV2: string;
}

export interface LimitSharingV2 {
  sharingLimited: boolean;
  trigger: string;
  limitSharingSettingTimestamp: string;
  initiatedByMe: boolean;
}

export interface MessageContextInfo {
  messageSecret: string;
  limitSharingV2: LimitSharingV2;
}

export interface MsgContent {
  // Coloquei como opcionais (?) pois outros tipos de mensagem (imagem, áudio)
  // podem não ter esses campos específicos.
  senderKeyDistributionMessage?: SenderKeyDistributionMessage;
  extendedTextMessage?: ExtendedTextMessage;
  messageContextInfo: MessageContextInfo;
  conversation?: string;
}

export interface WebhookEvent {
  event: string;
  instanceId: string;
  connectedPhone: string;
  connectedLid: string;
  isGroup: boolean;
  messageId: string;
  fromMe: boolean;
  chat: Chat;
  sender: Sender;
  moment: number;
  msgContent: MsgContent;
}
