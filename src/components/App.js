import React from 'react';

import Header from './Header';
import Inventory from './Inventory';
import Order from './Order';
import sampleFishes from '../sample-fishes';
import Fish from './Fish';

import base from '../base';

export default class App extends React.Component {

    constructor() {
        super();
        //initial state
        this.state = {
            fishes: {},
            order: {},
        }
        this.addFish = this.addFish.bind(this);
        this.updateFish = this.updateFish.bind(this);
        this.removeFish = this.removeFish.bind(this);
        this.loadSamples = this.loadSamples.bind(this);
        this.addToOrder = this.addToOrder.bind(this);
        this.removeFromOrder = this.removeFromOrder.bind(this);
    }

    componentWillMount() {
        //this runs right before the <App /> is rendered

        //hooks into firebase
        this.ref = base.syncState(`${this.props.params.storeId}/fishes`,
            {
                context: this,
                state: 'fishes',
            });

        //check if there is any order living in local storage
        const localStorageRef = localStorage.getItem(`order-${this.props.params.storeId}`);

        if (localStorageRef) {
            //update our App component's order state
            this.setState({
                //JSON.parse turns a string back into an object
                order: JSON.parse(localStorageRef)
            })
        }
    }

    componentWillUnmount() {
        base.removeBinding(this.ref);
    }

    componentWillUpdate(nextProps, nextState) {
        console.log("something changed");
        console.log({ nextProps, nextState });
        localStorage.setItem(`order-${this.props.params.storeId}`,
            // JSON.stringify turns an object into a string
            // This is necessary because local storage can only have basic info types
            // i.e. string, boolean, integer, etc. and not an object
            // otherwise you will see [object, Object]
            JSON.stringify(nextState.order))

    }

    addFish(fish) {
        //update state
        const fishes = { ...this.state.fishes };
        //add in our new fish
        const timestamp = Date.now();
        fishes[`fish-${timestamp}`] = fish;
        //set state
        this.setState({ fishes })
    }

    updateFish(key, updatedFish){
        const fishes = {...this.state.fishes};
        fishes[key] = updatedFish;
        this.setState({ fishes })
    }

    removeFish(key) {
        const fishes = {...this.state.fishes};
        fishes[key] = null;
        this.setState({ fishes });
    }

    loadSamples() {
        this.setState({
            fishes: sampleFishes,
        })
    }

    addToOrder(key) {
        //take a copy of our state
        const order = { ...this.state.order };
        //update or add the new number of fish ordered
        order[key] = order[key] + 1 || 1;
        //update our state
        this.setState({
            order
        })
    }

    removeFromOrder(key) {
        const order = {...this.state.order};
        delete order[key];
        this.setState({ order });
    }

    render() {
        return (
            <div className="catch-of-the-day">
                <div className="menu">
                    <Header tagline="Fresh Seafood Market" />
                    <ul className="list-of-fishes">
                        {
                            Object
                                // Turns an object into an array
                                .keys(this.state.fishes)
                                // Loops over the created array
                                .map(key => <Fish key={key} index={key} details={this.state.fishes[key]} addToOrder={this.addToOrder} />)
                        }
                    </ul>
                </div>
                <Order
                    fishes={this.state.fishes}
                    order={this.state.order}
                    params={this.props.params}
                    removeFromOrder={this.removeFromOrder}
                />
                <Inventory
                    addFish={this.addFish}
                    loadSamples={this.loadSamples}
                    removeFish={this.removeFish}
                    fishes={this.state.fishes}
                    updateFish={this.updateFish}
                />
            </div>
        )
    }
}

App.propTypes = {
    params: React.PropTypes.object.isRequired,
}