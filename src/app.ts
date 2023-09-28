/* Autobind decorator */

function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const orignalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = orignalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

class ProjectInput {
  templateElement: HTMLTemplateElement;
  root: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    this.root = document.getElementById("app") as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    /* Grabbing form HTML Elements */
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = "user-input";

    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;

    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;

    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    /* Call helper functions to append elements and handle submit to the DOM */
    this.configure();
    this.attach();
  }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTtitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    if (
      enteredTtitle.trim().length === 0 ||
      enteredDescription.trim().length === 0 ||
      enteredPeople.trim().length === 0
    ) {
      alert("Invalid input please try again!");
      return;
    } else {
      return [enteredTtitle, enteredDescription, +enteredPeople];
    }
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }
  /* Private methods to handle form events */
  @autobind
  private handleSubmit(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      console.log(title, desc, people);
      this.clearInputs();
    }
  }

  private configure() {
    this.element.addEventListener("submit", this.handleSubmit);
  }

  private attach() {
    this.root.insertAdjacentElement("afterbegin", this.element);
  }
}

const formInput = new ProjectInput();
