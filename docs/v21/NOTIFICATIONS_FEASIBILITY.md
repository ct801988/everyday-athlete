# Separate feasibility recommendation — iPhone notifications and Lock Screen

Checked 2026-10-19 against Apple/WebKit primary sources linked below. Recommendation: keep V2.1 foreground Silent/Short beep only. Do not add permission prompts or services in this milestone.

Installed Home Screen web apps on iOS/iPadOS 16.4+ can request Web Push permission following a direct user gesture. Notifications can appear on the Lock Screen, subject to user/device notification settings. This does not make page JavaScript or Web Audio run continuously while suspended. No promise of precise rest-timer sound, wake-up or continuous countdown should be made for this static app.

Ordinary remote push needs a trusted sender: subscription endpoint/key storage, authenticated scheduling/cancellation, VAPID/private credentials and a backend or push provider. GitHub Pages serves static assets and cannot safely hold sender secrets or execute scheduled sends. A future push service could store only an opaque subscription and a deadline rather than workout history, with expiry, opt-out/deletion and no sensitive notification content. Delivery timing remains best effort; changed/cancelled timers must cancel or invalidate pending notifications. No reliable offline push promise.

Newer Declarative Web Push changes how a received notification is displayed and reduces dependence on service-worker JavaScript; it still involves a remote push subscription and message. It is not a local scheduled-alarm API. Feature detection and compatibility tests would be required.

Native Live Activities use ActivityKit/WidgetKit and, for remote updates, APNs. They are not a capability provided by the current static PWA. A continuously updating sports-app-style Lock Screen surface would require a separately scoped native iOS application/extension architecture and distribution review. A generic wrapper alone does not automatically provide correct Live Activities.

Cost/privacy: existing foreground beep adds no hosting service cost. Future push/native work needs separate cost estimates covering usage limits, operation/maintenance, subscription retention, credentials, delivery failures and any developer distribution charges. No paid/free provider has been selected, created or authorized. WebKit states Web Push itself does not require Apple Developer Program membership; do not confuse this with native distribution costs. No login is required merely to opt into a future push design, but safe subscriber management still needs a reviewed privacy/security design.

Approval gate: first choose whether occasional best-effort notifications are valuable enough to justify a backend. If yes, prepare a specific provider/cost/privacy/cancellation prototype plan; owner approval before subscriptions, permissions, accounts or infrastructure. Retain accurate foreground/in-app completion as the reliable current interaction. Physical iPhone/Home Screen/Focus/locked/suspended tests remain necessary.

Sources:
- [WebKit: Web Push for Web Apps on iOS and iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/) — installation, user gesture, permission, notification surfaces and developer membership.
- [Apple: Sending web push notifications](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers) — subscription, server and permission architecture.
- [WebKit: Meet Declarative Web Push](https://webkit.org/blog/16535/meet-declarative-web-push/) — remote push/fallback display, not continuous background page execution.
- [Apple: Displaying live data with Live Activities](https://developer.apple.com/documentation/activitykit/displaying-live-data-with-live-activities) and [WidgetKit](https://developer.apple.com/documentation/widgetkit) — native ActivityKit/WidgetKit/APNs distinction.

These are feasibility conclusions, not implementation or spending authorization.
