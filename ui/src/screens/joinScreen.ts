export class JoinScreen {
    private usernameInput: HTMLInputElement;
    private joinButton: HTMLButtonElement;
    private container: HTMLDivElement
    private onJoin: (username: string) => void;

    constructor(onJoin: (username: string) => void) {
        this.onJoin = onJoin;

        // Create div container
        this.container = document.createElement("div");
        this.container.className = "join-container";

        // Create input field
        this.usernameInput = document.createElement("input");
        this.usernameInput.type = "text";
        this.usernameInput.placeholder = "Enter username";

        // Create join button
        this.joinButton = document.createElement("button");
        this.joinButton.textContent = "Join the Arena";

        // Event listener to join: Enter
        this.usernameInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const username = this.usernameInput.value.trim();
                if (username) {
                    this.onJoin(username);
                    this.hide();
                }
            }
        })

        // Event listener for join: Button
        this.joinButton.addEventListener("click", () => {
            const username = this.usernameInput.value.trim();
            if (username) {
                this.onJoin(username);
                this.hide();
            }
        })


        // Add to DOM
        this.container.append(this.usernameInput);
        this.container.appendChild(this.joinButton);
        document.body.appendChild(this.container);
    }


    hide() {
        this.usernameInput.remove();
        this.joinButton.remove();
    }
}
