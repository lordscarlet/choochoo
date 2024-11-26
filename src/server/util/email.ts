import Mailjet from "node-mailjet";
import z from "zod";
import { decrypt, encrypt } from "./encrypt";
import { environment } from "./environment";

export abstract class EmailService {
  abstract subscribe(email: string): Promise<void>;
  abstract sendActivationCode(email: string): Promise<void>;

  protected makeActivationCode(email: string): string {
    const expires = new Date();
    expires.setHours(expires.getMinutes() + 30);
    const code: ActivationCode = {
      email,
      expires: expires.getTime(),
    };
    return encrypt(JSON.stringify(code));
  }

  getEmailFromActivationCode(code: string): string | undefined {
    try {
      const decrypted = ActivationCode.parse(JSON.parse(decrypt(code)));
      if (Date.now() > decrypted.expires) return undefined;
      return decrypted.email;
    } catch (e) {
      return undefined;
    }
  }
}

const ActivationCode = z.object({
  email: z.string(),
  expires: z.number(),
});
type ActivationCode = z.infer<typeof ActivationCode>;

class MailjetEmailService extends EmailService {
  private readonly mailjet: Mailjet;
  constructor(key: string, secret: string) {
    super();
    this.mailjet = Mailjet.apiConnect(key, secret);
  }


  async subscribe(email: string): Promise<void> {
    try {
      await this.mailjet.post("contact", { 'version': 'v3' })
        .request({ "Email": email, "Name": email });
      await this.mailjet
        .post("listrecipient", { 'version': 'v3' })
        .request({
          "IsUnsubscribed": "false",
          "ContactAlt": email,
          "ListID": "10484665",
        })
    } catch (e: any) {
      if (e.ErrorMessage?.includes('already exists')) {
        return;
      }
      throw e;
    }
  }

  async sendActivationCode(email: string): Promise<void> {
    try {
      await emailService.subscribe(email);
      const activationCode = this.makeActivationCode(email);
      const result = await this.mailjet.post("send", { 'version': 'v3.1' })
        .request({
          "Messages": [
            {
              "From": {
                "Email": "choochoo@mail.choochoo.games",
                "Name": "Choo Choo Games"
              },
              "To": [
                {
                  "Email": email,
                  "Name": email,
                }
              ],
              "Subject": "Activate your account",
              "TextPart": 'Welcome to Choo Cho Games! Copy and paste the following link into your browser window to activate: https://www.choochoo.games/app/users/activate?activationCode=' + activationCode,
              "HTMLPart": `
<h3>Welcome to Choo Choo Games!</h3>
<p>Click the following link to activate your account.</p>
<p><a href="https://www.choochoo.games/app/users/activate?activationCode=${activationCode}">Activate</a></p>
<p>I hope you enjoy the games! CCMF!</p>
<p>-Nathan</p>`,
            },
          ],
        });
      console.log('mailjet', email, (result.body as any).Messages);
    } catch (e) {
      console.log('failed to send an email');
      console.error(e);
    }
  }
}

class NoopEmailService extends EmailService {
  async subscribe(_: string): Promise<void> { }

  async sendActivationCode(email: string): Promise<void> {
    console.log('activation code', `/app/users/activate?activationCode=${this.makeActivationCode(email)}`);
  }
}

export const emailService =
  environment.mailjetKey == null || environment.mailjetSecret == null
    ? new NoopEmailService()
    : new MailjetEmailService(environment.mailjetKey, environment.mailjetSecret);