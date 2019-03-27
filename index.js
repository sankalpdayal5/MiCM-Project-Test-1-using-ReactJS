import React, { Component } from 'react';
import { render } from 'react-dom';
import './style.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      isLoaded: false,
      displayTooltip: false,

      heading: 'Users',
      street: 'Street: ',
      suite: 'Suite: ',
      city: 'City: ',
      zip: 'Zip: '
    };
    this.hideTooltip = this.hideTooltip.bind(this)
    this.showTooltip = this.showTooltip.bind(this)
  }

  hideTooltip() {
    this.setState({ displayTooltip: false })
  }
  showTooltip() {
    this.setState({ displayTooltip: true })
  }

  handleMouseIn() {
    this.setState({ hover: true })
  }

  handleMouseOut() {
    this.setState({ hover: false })
  }

  componentDidMount() {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then(res => res.json())
      .then(json => {
        this.setState({
          isLoaded: true,
          items: json
        })
      })
  }

  render() {
    const tooltipStyle = {
      display: this.state.hover ? 'block' : 'none'
    }
    const Bold = ({ children }) => <Text style={{ fontWeight: 'bold' }}>{children}</Text>

    var { isLoaded, items } = this.state;

    const userData =
      <label>
        {items.map(item => (
          <li key={item.id} className={'names'}>

            <label className={'name'}>
              <Tooltip message={
                this.state.street + item.address.street + "\n" +
                this.state.suite + item.address.suite + "\n" +
                this.state.city + item.address.city + "\n" +
                this.state.zip + item.address.zipcode + "\n"
              }
                position={'right'}>

                {item.name}
              </Tooltip>
            </label>

            <label className={'username'}> ({item.username}) </label>
          </li>
        ))}
      </label>


    if (!isLoaded) {
      return <div>Loading ... </div>
    }
    else {
      return (
        <div className={'App'}>
          <h1>{this.state.heading}</h1>
          <div className='users'>
            {userData}
          </div>
        </div>
      );
    }
  }
}

class Tooltip extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      displayTooltip: false
    }
    this.hideTooltip = this.hideTooltip.bind(this)
    this.showTooltip = this.showTooltip.bind(this)
  }

  hideTooltip() {
    this.setState({ displayTooltip: false })

  }
  showTooltip() {
    this.setState({ displayTooltip: true })
  }

  render() {
    let message = this.props.message
    let position = this.props.position
    return (
      <span className='tooltip'
        onMouseLeave={this.hideTooltip}
      >
        {this.state.displayTooltip &&
          <div className={`tooltip-bubble tooltip-right`}>
            <div className='tooltip-message'>{message}</div>
          </div>
        }
        <span
          className='tooltip-trigger'
          onMouseOver={this.showTooltip}
        >
          {this.props.children}
        </span>
      </span>
    )
  }
}



render(<App />, document.getElementById('root'));
