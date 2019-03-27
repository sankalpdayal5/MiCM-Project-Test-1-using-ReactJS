const Redux = window.Redux;
const ReactRedux = window.ReactRedux;
const ReduxThunk = window.ReduxThunk;

const { Provider, connect } = ReactRedux;
const { createStore, applyMiddleware, combineReducers } = Redux;
const thunk = ReduxThunk.default;

// API
const getPersonInfo = () =>
  axios.get('https://randomuser.me/api', {
    params: {
      results: 50,
      inc: 'name,gender,phone,email,picture,login'
    }
  })
    .then(response => {
      if (response.status !== 200) {
        throw new Error('randomuser server is down!');
      }
      const userList = response.data.results.map(data => ({
        profile: data.picture.large,
        fName: data.name.first,
        lName: data.name.last,
        email: data.email,
        userGender: data.gender,
        phone: data.phone,
        md5: data.login.md5
      }));
      return userList;
    })
    .catch(error => {
      throw new Error('catch failed: ', error);
    });
// Action
const actions = {
  fetchUserStart: () => ({ type: 'FETCH_USER_START' }),
  receiveDataSuccess: userList => ({
    type: 'RECEIVE_DATA',
    payload: userList
  }),

  receiveDataFail: error => ({
    type: 'FETCH_ERROR',
    payload: error
  }),

  setSearchText: searchText => ({
    type: 'SET_SEARCH_TEXT',
    payload: searchText
  }),
  getRandomAction: () =>
    dispatch => {
      dispatch(actions.fetchUserStart());
      getPersonInfo()
        .then(respond => {
          dispatch(actions.receiveDataSuccess(respond));
        })
        .catch(error => {
          dispatch(actions.receiveDataFail(error));
        });
    }
};
// Reducer
const initialState = {
  isLoading: false,
  errorMessage: null,
  user: [],
  searchText: ''
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "FETCH_USER_START":
      return Object.assign({}, state, {
        isLoading: true,
        errorMessage: null,
        user: []
      });
    case "RECEIVE_DATA":
      return Object.assign({}, state, {
        isLoading: false,
        errorMessage: null,
        user: action.payload
      });
    case "SET_SEARCH_TEXT":
      return Object.assign({}, state, {
        searchText: action.payload
      });
    case 'FETCH_ERROR':
      return Object, assign({}, state, {
        isLoading: false,
        user: [],
        errorMessage: action.payload
      });
    default:
      return state;
  }
}

// React Main Component
class App extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.props.fetchData();
  }
  handleChange(e) {
    this.props.handleSearchText(e.target.value);
  }
  handleReFetch() {
    this.props.fetchData();
  }

  render() {
    const { isLoading, user = [], errorMessage, searchText } = this.props;
    const matchesFilter = new RegExp(searchText, 'i');
    const filtereduser = user.filter(u => !searchText || matchesFilter.test(u.fName) || matchesFilter.test(u.lName));
    // Set dynamic class name
    const ConditionalClass = classNames({
      'user waiting-on-data': isLoading,
      'user': !isLoading
    });
    // Set rendering result
    const renderUserList = () => {
      if (!isLoading && errorMessage !== null) {
        return (<h1>{errorMessage}</h1>);
      } else if (isLoading) {
        // Generate a sequence of ID
        const asyncUI = new Array(10).fill(1).map(i => Math.random().toFixed(5));
        return asyncUI.map(value => <UserCard key={value} />);
      }
      return filtereduser.map(value => <UserCard key={value.md5} {...value} />);
    };
    return (
      <div className='skelecon-screen'>
        <header>
          <Input inputType='text' inputValue={searchText} onChangeValue={this.handleChange.bind(this)} inputPlaceHolder='Search by name' />
          <button className="button expanded" onClick={this.handleReFetch.bind(this)}>CHANGE USER GROUP</button>
        </header>
        <ul className={ConditionalClass}>
          {renderUserList()}
        </ul>
      </div>
    );
  }
};

// Using React-Redux to connect the main component
const mapStateToProps = state => state;
const mapDispatchToProps = dispatch => ({
  fetchData: () => dispatch(actions.getRandomAction()),
  handleSearchText: text => dispatch(actions.setSearchText(text))
});
const WrappedApp = connect(mapStateToProps, mapDispatchToProps)(App);

// Type checking for main component
App.propsType = {
  fetchData: React.PropTypes.func.isRequired,
  handleSearchText: React.PropTypes.func.isRequired,
  user: React.PropTypes.array.isRequired
}

// Reusable component 01, User Card , Skeleton Screen has happend here.
const UserCard = props => {
  const { profile, fName, lName, userGender, phone, md5, email } = props;
  return (
    <li className="ui-item" id={md5}>
      <div className="profile">
        <div className="img-wrapper">
          <Image imageURL={profile} imageAlt={fName} />
        </div>
      </div>
      <UserInfo firstName={fName} lastName={lName} gender={userGender} email={email} phone={phone} />
    </li>
  );
};

// Reusable component 02
const Input = props => {
  const { onChangeValue, inputType, inputValue, inputPlaceHolder } = props;
  const onChangeValueFunc = target => onChangeValue(target);
  return (<input type={inputType} value={inputValue} onChange={onChangeValueFunc} placeholder={inputPlaceHolder} />);
};
Input.propsType = {
  inputType: React.PropTypes.oneOf(['text', 'checkbox', 'radio', 'number', 'email', 'password', 'submit']).isRequired,
  onChangeValue: React.PropTypes.func.isRequired,
  inputPlaceHolder: React.PropTypes.string,
  inputValue: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ]).isRequired
};
// Reusable component 03
const Image = props => {
  const { imageURL, imageAlt } = props;
  if (typeof imageURL === 'string') {
    return <img src={imageURL} alt={imageAlt} />;
  }
  return <img src='' alt="placeholder" />;
};
Image.propTypes = {
  imageURL: React.PropTypes.string,
  imageAlt: React.PropTypes.string
};
// Reusable component 04
const UserInfo = props => {
  const { firstName, lastName, gender, email, phone } = props;
  return (
    <div className="user-info">
      <div className="name">{firstName} {lastName}</div>
      <div className="gender">{gender}</div>
      <div className="email">{email}</div>
      <div className="phone">{phone}</div>
    </div>
  );
};
UserInfo.propTypes = {
  firstName: React.PropTypes.string,
  lastName: React.PropTypes.string,
  gender: React.PropTypes.string,
  email: React.PropTypes.string,
  phone: React.PropTypes.string
};


// Redux Store
const Store = Redux.createStore(reducer, applyMiddleware(thunk));

// Mount the component to the DOM
const element = document.getElementById('App');
ReactDOM.render(
  <Provider store={Store}>
    <WrappedApp />
  </Provider>,
  element, 0
);

