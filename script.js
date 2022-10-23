// Model 只关心数据
class Model {
  constructor() {
    this.todoList = [{
      id: 0,
      text: 1,
      complete: false
    }]
  }

  addTodo(todo) {
    this.todoList = [...this.todoList, todo]

    this.onTodoListChanged(this.todoList)
  }

  editTodo(id, updatedText) {
    this.todoList = this.todoList.map(todo => {
      todo.id === id ? { id: todo.id, text: updatedText, complete: todo.complete } : todo
    })

    this.onTodoListChanged(this.todoList)
  }

  delTodo(id) {
    this.todoList = this.todoList.filter(todo => todo.id !== id)

    this.onTodoListChanged(this.todoList)
  }

  toggleTodo(id) {
    this.todoList = this.todoList.map(todo =>
      todo.id === id ? { id: todo.id, text: todo.text, complete: !todo.complete } : todo
    )

    this.onTodoListChanged(this.todoList)
  }

  bindEvents(controller) {
    this.onTodoListChanged = controller.onTodoListChanged
  }
}

class View {
  constructor() {
    this.app = this.getElement('#root')

    this.title = this.createElement('h3')
    this.title.innerText = 'MVC-todo-demo'

    this.listHeader = this.createElement('div', 'header')
    this.headerInput = this.createElement('input', 'header__input')
    this.headerInput.placeholder = '请填写事项名称'
    this.headerAddBtn = this.createElement('button', 'header__button')
    this.headerAddBtn.innerText = '添加'
    this.listHeader.appendChild(this.headerInput)
    this.listHeader.appendChild(this.headerAddBtn)

    this.todoList = this.createElement('ul', 'todo-list')

    this.app.appendChild(this.title)
    this.app.appendChild(this.listHeader)
    this.app.appendChild(this.todoList)
  }

  /**
 * 创造元素，绑定 CSS（可选）
 * @param {*} tag 
 * @param {*} className 
 * @returns 
 */
  createElement(tag, className) {
    const elem = document.createElement(tag);
    if (className) elem.classList.add(className)
    return elem;
  }

  /**
   * 获取 DOM 元素
   * @param {*} selector 
   * @returns 
   */
  getElement(selector) {
    return document.querySelector(selector)
  }

  get todoText() {
    return this.headerInput.value
  }

  resetInput() {
    this.headerInput.value = ''
  }

  resetTodoList() {
    this.todoList.innerHTML = ''
  }

  renderTodos(todos) {
    this.resetTodoList()
    todos.forEach(todo => {

      const todoItem = this.createElement('li', 'todo-item')
      todoItem.id = todo.id

      const checkBox = this.createElement('input', 'todo-item__state')
      checkBox.type = 'checkbox'
      checkBox.checked = todo.complete

      const issueName = this.createElement('span', 'todo-item__name')
      issueName.contentEditable = true

      if (todo.complete) {
        const striker = this.createElement('s')
        striker.innerText = todo.text
        issueName.appendChild(striker)
      } else {
        issueName.innerText = todo.text
      }

      const issueDelBtn = this.createElement('button', 'todo-item__button')
      issueDelBtn.innerText = '删除'

      todoItem.appendChild(checkBox)
      todoItem.appendChild(issueName)
      todoItem.appendChild(issueDelBtn)

      this.todoList.appendChild(todoItem)
    })
  }

  bindEvents(controller) {
    this.headerAddBtn.addEventListener('click', controller.handleAddTodo)
    this.todoList.addEventListener('click', controller.handleDelTodo)
    this.todoList.addEventListener('change', controller.handleToggle)
  }

}

class Controller {
  constructor(model, view) {
    this.model = model
    this.view = view

    this.model.bindEvents(this)
    this.view.bindEvents(this)

    this.onTodoListChanged(this.model.todoList)
  }

  onTodoListChanged = todos => {
    this.view.renderTodos(todos)
  }

  handleAddTodo = event => {
    event.preventDefault()

    if (this.view.todoText) {
      const todo = {
        id: this.model.todoList.length > 0 ? this.model.todoList[this.model.todoList.length - 1].id + 1 : 1,
        text: this.view.todoText,
        complete: false
      }

      this.model.addTodo(todo)
      this.view.resetInput()
      return
    }
    alert("文字不能为空哦 ~")
  }

  handleDelTodo = event => {
    if (event.target.className === 'todo-item__button') {
      const id = parseInt(event.target.parentElement.id)
      this.model.delTodo(id)
    }
  }

  handleToggle = event => {
    if (event.target.type === 'checkbox') {
      const id = parseInt(event.target.parentElement.id)
      this.model.toggleTodo(id)
    }
  }

}

new Controller(new Model(), new View())