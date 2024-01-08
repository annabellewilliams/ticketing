import { ExpirationCompleteEvent, Publisher, Subjects } from "@micro-git-tix/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}
