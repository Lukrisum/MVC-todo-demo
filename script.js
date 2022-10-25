// Model 只关心数据
class Model {
  constructor() {
    this.todoList = JSON.parse(localStorage.getItem('MVC-todo-list') || '[]')
  }

  addTodo(todoText) {

    const todo = {
      id: this.todoList.length > 0 ? this.todoList[this.todoList.length - 1].id + 1 : 1,
      text: todoText,
      complete: false
    }

    this.todoList = [...this.todoList, todo]
    localStorage.setItem('MVC-todo-list', JSON.stringify(this.todoList))

    this.onTodoListChanged(this.todoList)
  }

  editTodo(id, updatedText) {
    this.todoList = this.todoList.map(todo =>
      todo.id === id ? { id: todo.id, text: updatedText, complete: todo.complete } : todo
    )
    localStorage.setItem('MVC-todo-list', JSON.stringify(this.todoList))

    this.onTodoListChanged(this.todoList)
  }

  delTodo(id) {
    this.todoList = this.todoList.filter(todo => todo.id !== id)
    localStorage.setItem('MVC-todo-list', JSON.stringify(this.todoList))

    this.onTodoListChanged(this.todoList)
  }

  toggleTodo(id) {
    this.todoList = this.todoList.map(todo =>
      todo.id === id ? { id: todo.id, text: todo.text, complete: !todo.complete } : todo
    )
    localStorage.setItem('MVC-todo-list', JSON.stringify(this.todoList))

    this.onTodoListChanged(this.todoList)
  }

  bindOnTodoListChanged(cb) {
    this.onTodoListChanged = cb
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

  get __todoText() {
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
      issueName.setAttribute('placeholder', '编辑内容不能为空哦~')

      if (todo.complete) {
        const striker = this.createElement('s')
        striker.innerText = todo.text
        issueName.appendChild(striker)
      } else {
        issueName.innerText = todo.text
        issueName.contentEditable = true
      }

      const issueDelBtn = this.createElement('button', 'todo-item__button')
      issueDelBtn.innerText = '删除'

      todoItem.appendChild(checkBox)
      todoItem.appendChild(issueName)
      todoItem.appendChild(issueDelBtn)

      this.todoList.appendChild(todoItem)
    })
  }

  bindHandleAddTodo(cb) {
    this.headerAddBtn.addEventListener('click', (event) => {
      event.preventDefault()

      this.__todoText && cb(this.__todoText)

      this.resetInput()
    })
  }

  bindHandleDelTodo(cb) {
    this.todoList.addEventListener('click', event => {
      if (event.target.className === 'todo-item__button') {
        const id = parseInt(event.target.parentElement.id)
        cb(id)
      }
    })
  }

  bindHandleEditTodo(cb) {

    this.todoList.addEventListener('focusin', event => {
      if (event.target.className === 'todo-item__name') {
        this.__stage = event.target.innerText
      }
    })

    this.todoList.addEventListener('input', event => {
      if (event.target.className === 'todo-item__name') {
        this.temporaryEditValue = event.target.innerText
      }
    })

    this.todoList.addEventListener('focusout', event => {
      if (this.temporaryEditValue) {
        const id = parseInt(event.target.parentElement.id)
        cb(id, this.temporaryEditValue)
        this.temporaryEditValue = ''
        return
      }
      event.target.innerText = this.__stage
    })

  }

  bindHandleToggle(cb) {
    this.todoList.addEventListener('change', event => {
      if (event.target.type === 'checkbox') {
        const id = parseInt(event.target.parentElement.id)
        cb(id)
      }
    })
  }

}

class Controller {
  constructor(model, view) {
    this.model = model
    this.view = view

    this.onTodoListChanged(this.model.todoList)
    this.model.bindOnTodoListChanged(this.onTodoListChanged)
    this.view.bindHandleAddTodo(this.handleAddTodo)
    this.view.bindHandleDelTodo(this.handleDelTodo)
    this.view.bindHandleEditTodo(this.handleEditTodo)
  }

  onTodoListChanged = (todos) => {
    this.view.renderTodos(todos)
  }

  // 理想模式下，这里只操作 model 层（避免 model 与 View 混写）
  handleAddTodo = todoText => {
    this.model.addTodo(todoText)
  }

  handleDelTodo = id => {
    this.model.delTodo(id)
  }

  handleToggle = id => {
    this.model.toggleTodo(id)
  }

  handleEditTodo = (id, editValue) => {
    this.model.editTodo(id, editValue)
  }

}

new Controller(new Model(), new View())