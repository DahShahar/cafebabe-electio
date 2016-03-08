import React from 'react';
import VoteThumbnail from './voteThumbnail';
//import StatusUpdateEntry from './statusupdateentry';
//import {getFeedData, postStatusUpdate} from '../server';
import {getAllCandidatesOfParty} from '../server';


export default class VoteDem extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      candidates: [
        {
          "headImage": "",
          "logoImage": "",
          "fullName": "",
          "party": 1,
          "thumbType": "",
          "description": "",
          "twitterFeed": "",
          "campaignWebsite": "",
          "wikipedia": "",
          "age": "",
          "quote": ""
        }
      ]
    };
  }

  refresh() {
    getAllCandidatesOfParty(1, (out) => {
      this.setState({candidates: out});
    })
   }

  componentDidMount() {
    this.refresh();
  }

  render() {
    //this.refresh();
    //console.log(this.state.candidates);
      return (
        <div>
          <h1>Vote</h1>

            <div className="row">
              <ul className="nav nav-tabs">
                <li role="presentation" className="active">
                  <a href="#/vote/Democrat">Democrat</a>
                </li>
                <li role="presentation" className="inactive">
                  <a href="#/vote/Republican">Republican</a>
                </li>
                <li role="presentation" className="inactive">
                  <a href="#/vote/Independent">Independent</a>
                </li>
              </ul>
            </div>

            <div className="row">
              <div className="col-md-4 col-md-offset-4">
                <img src="img/partyLogos/democraticParty.png" width="100%"/>

              </div>
            </div>

            <div className="row">
              <div className="col-md-6 col-md-offset-3">
                <hr />
                <h2>Democratic Party</h2>
                <hr />
              </div>
            </div>
            {this.state.candidates.map((candidate, i) =>
              <VoteThumbnail key={i} uid={i} data={candidate}/>
            )}
          
        </div>

      );



  }
}
