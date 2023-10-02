// Project Type
enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public projectStatus: ProjectStatus
  ) {}
}

type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListner(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

// Project State Management

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }
  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProjects(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

/* Validation interface logic */

interface ValidInputs {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatedInputs: ValidInputs) {
  let isValid = true;
  if (validatedInputs.required) {
    isValid = isValid && validatedInputs.value.toString().trim().length !== 0;
  }
  if (
    validatedInputs.minLength !== undefined &&
    typeof validatedInputs.value === "string"
  ) {
    isValid =
      isValid && validatedInputs.value.length >= validatedInputs.minLength;
  }
  if (
    validatedInputs.maxLength !== undefined &&
    typeof validatedInputs.value === "string"
  ) {
    isValid =
      isValid && validatedInputs.value.length <= validatedInputs.maxLength;
  }
  if (
    validatedInputs.min != null &&
    typeof validatedInputs.value === "number"
  ) {
    isValid = isValid && validatedInputs.value > validatedInputs.min;
  }
  if (
    validatedInputs.max != null &&
    typeof validatedInputs.value === "number"
  ) {
    isValid = isValid && validatedInputs.value < validatedInputs.max;
  }
  return isValid;
}

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

//Component Base Class
//Cannot be instanstaited
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  root: T;
  element: U;

  constructor(
    templateID: string,
    hostElementID: string,
    insertAtStart: boolean,
    newElementID?: string
  ) {
    this.templateElement = document.getElementById(
      templateID
    )! as HTMLTemplateElement;
    this.root = document.getElementById(hostElementID) as T;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as U;
    if (newElementID) {
      this.element.id = newElementID;
    }
    this.attach(insertAtStart);
  }
  private attach(insertAtBeginning: boolean) {
    this.root.insertAdjacentElement(
      insertAtBeginning ? "afterbegin" : "beforeend",
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

/* Project List Class Objectt*/

class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }
  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = "";
    for (const prjItem of this.assignedProjects) {
      const listItem = document.createElement("li");
      listItem.textContent = prjItem.title;
      listEl.appendChild(listItem);
    }
  }
  configure(): void {
    projectState.addListner((projects: Project[]) => {
      const relevantProjects = projects.filter((prj) => {
        if (this.type === "active") {
          return prj.projectStatus === ProjectStatus.Active;
        }
        return prj.projectStatus === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }
  renderContent() {
    const listID = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listID;
    this.element.querySelector("h2")!.textContent =
      this.type.toLocaleUpperCase() + "PROJECTS";
  }
}

/* Project Creation Object */

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");

    /* Call helper functions to append elements and handle submit to the DOM */
    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;

    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;

    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;
    this.configure();
  }

  configure() {
    this.element.addEventListener("submit", this.handleSubmit);
  }
  renderContent(): void {}
  private gatherUserInput(): [string, string, number] | void {
    const enteredTtitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    /* Checking to see if inputs are valid */

    const titleValidatable: ValidInputs = {
      value: enteredTtitle,
      required: true,
    };
    const descriptionValidatable: ValidInputs = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };
    const peopleValidatable: ValidInputs = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5,
    };

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
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
      projectState.addProjects(title, desc, people);
      this.clearInputs();
    }
  }
}

const formInput = new ProjectInput();
const activeList = new ProjectList("active");
const finishedList = new ProjectList("finished");
