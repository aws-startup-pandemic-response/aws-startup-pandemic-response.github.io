import React from 'react';
import ReactDOM from 'react-dom';
import itemsjs from 'itemsjs'; 
import "react-bootstrap/dist/react-bootstrap.min.js"
import { Button, ButtonToolbar} from 'react-bootstrap';
import AddToCalendar from 'react-add-to-calendar';



class CompanySearch extends React.Component {
  constructor(props) {
    super(props);

    var rows = props.rows;
    var townHalls = props.townHalls;

    this.state = {
      showSiteSummary: false,
      nextTownhallEvent: townHalls[0],
      configuration: {
        searchableFields: ['Customer', 'Description', 'Delivery Regions', 'C19 Tags'],
        sortings: {
          name_asc: {
            field: 'Customer',
            order: 'asc'
          }
        },
        aggregations: {
          "VideoTag": {
            title: 'Townhall Presenters',
            size: 20
          },
          "C19 Cat": {
            title: 'Category',
            size: 20
          },
          "C19 Tags": {
            title: 'Use Case',
            size: 50
          },
          "Delivery Regions": {
            title: 'Delivery Regions',
            size: 20
          },
          "C19 Stage": {
            title: 'Stage',
            size: 20
          }
        }
      }
    }

    var newFilters = {};
    Object.keys(this.state.configuration.aggregations).map(function (v) {
      newFilters[v] = [];
    })

    // Copying this.state using the spread op (...this.state)
    this.state = {
      ...this.state,
      // the rows comes from external resources
      // https://github.com/itemsapi/itemsapi-example-data/blob/master/jsfiddle/imdb.js
      
      // In React line below is:
      //itemsjs: require('itemsjs')(rows, this.state.configuration),
      itemsjs: itemsjs(rows, this.state.configuration),

      query: '',
      filters: newFilters,
    }
    
    
    this.toggleSiteDescription = this.toggleSiteDescription.bind(this);
  }

  changeQuery(e) {
    this.setState({
      query: e.target.value
    });
  }

  reset() {
    var newFilters = {};
    Object.keys(this.state.configuration.aggregations).map(function (v) {
      newFilters[v] = [];
    })
    this.setState({
      filters: newFilters,
      query: '',
    })
  }

  handleCheckbox = (filterName, filterValue) => event => {
    const oldFilters = this.state.filters;
    let newFilters = oldFilters
    let check = event.target.checked;

    if (check) {
      newFilters[filterName].push(filterValue)

      this.setState({
        filters: newFilters
      })
    } else {
      var index = newFilters[filterName].indexOf(filterValue);
      if (index > -1) {
        newFilters[filterName].splice(index, 1);
        this.setState({
          filters: newFilters
        })
      }
    }
  }

  get searchResult() {

    var result = this.state.itemsjs.search({
      per_page: 1000,
      query: this.state.query,
      filters: this.state.filters
    })
    return result
  }
  
  toggleSiteDescription() {
    this.setState(state => ({
      showSiteSummary: !state.showSiteSummary
    }));
  }


  render() {
    
    var siteDescToggledOnClass = this.state.showSiteSummary ? "whatThisIsCopy siteDescriptionToggledOn" : "whatThisIsCopy siteDescriptionToggledOff";
    var siteDescToggledOnCopy = this.state.showSiteSummary ? "Less about this site" : "More about this site";
    var calendarLinkUrl = 'webcal://' + window.location.href + 'StartupPandemicResponseVirtualTownhallTelemedicineTriage.ics';
    

    
    return (
      <div>
        <nav className="navbar navbar-default navbar-fixed-top">
          <div className="container">
            <div className="navbar-header">
              <a className="navbar-brand title" href="#" onClick={this.reset.bind(this)}><img className='awshclsLogo' src={process.env.PUBLIC_URL + 'aws.hcls.logo.png'} /> Startup Pandemic Response</a>
            </div>
            <div id="navbar">
              <form className="navbar-form navbar-left">
                <div className="form-group">
                  <input type="text" value={this.state.query} onChange={this.changeQuery.bind(this)} className="form-control" placeholder="Search" />
                </div>
              </form>
              <a className="siteDescriptionToggle" href='#' onClick={this.toggleSiteDescription} > {siteDescToggledOnCopy}</a>
            </div>
          </div>
        </nav>

        <div className="container" >
        {/*<div className="townhallNotice">
            <div className='townhallText'>
              <b>Join us for  a virtual startup presentation on telemedicine and triage April 7 at 11 am EST </b>
            </div>
            <div className='addToCalendarDiv'>
              <AddToCalendar event={this.state.nextTownhallEvent} />
            </div>
        </div>*/}
        <div className={siteDescToggledOnClass}>
          The healthcare startup team at AWS is working to more rapidly get relevant, production-ready, clinically-adopted solutions into the hands of healthcare providers around the world. This site is an evolving effort to match inbound demand from care providers around the world with best-in-breed solutions.
          If you believe you have a relevant solution and wish us to evaluate for inclusion, <a href='https://airtable.com/shr4TqPNqXOtNojvj/' target="_blank"> please let us know here.</a>
          <br />
          <small>*Note, we are looking to connect parties who will then evaluate one another for suitability and fit. Nothing herein should be considered an endorsement of any particular company or solution.</small>
        </div>
          
          
          
          <div className="row">
            <div className="col-4 col-md-3 facets">
              {
                Object.entries(this.searchResult.data.aggregations).map(([key, value]) => {
                  return (
                    <div key={key}>
                      <h5 style={{ marginBottom: '5px' }}><strong style={{ color: '#FF9900' }}>{value.title}</strong></h5>

                      <ul className="browse-list list-unstyled long-list" style={{ marginBottom: '0px' }}>
                        {
                          Object.entries(value.buckets).map(([keyB, valueB]) => {
                            return (
                              <li key={valueB.key}>
                                <div className="checkbox block" style={{ marginTop: '0px', marginBottom: '0px' }}>
                                  <label>
                                    <span><input className="checkbox" type="checkbox" checked={this.state.filters[value.name].indexOf(valueB.key)>-1 || false} onChange={this.handleCheckbox(value.name, valueB.key)} />
                                     &nbsp;{valueB.key} <small>({valueB.doc_count})</small></span>
                                  </label>
                                </div>
                              </li>
                            )
                          })
                        }
                      </ul>
                    </div>
                  )
                })
              }
            </div>
            <div className="col-8 col-md-9">
            <div className="breadcrumbs"></div>
            <div className="clearfix"></div>
            <div className="table table-striped">
                {
                  Object.entries(this.searchResult.data.items).map(([key, item]) => {
                  
                    var logoUrl = "";
                    
                    if(item["Logo"][0]){
                      //logoUrl = item["Logo"][0]["thumbnails"]["large"]["url"];
                      logoUrl = item["Logo"][0]["url"];
                    }
                    
                    function TownhallVideoPrezo(params) {
                    
                      if(params.videoUrl == ""){
                        return <div></div>
                      } else {
                        return <div className='townhallLinkSection' >
                            <a href={params.videoUrl} target='_blank' >Watch the AWS Startup Pandemic Response Townhall featuring {params.cutomerName}</a>
                          </div>
                                                
                      }
                    }
                    

                    var contactString = "mailto:hcls-startups@amazon.com?subject=Introduction to " + item.Customer +"&body=(Please include your name, company, and title)";
                  
                    return (
                    <div className="companyRow" key={key}>
                      <div className='companyIcon'>
                        <img src={ logoUrl } />
                      </div>
                      <div className="companyDescriptionColumn">
                          <h5><b><a href={item["URL"]} target='_blank'> {item.Customer}</a></b></h5>
                          <div>
                              <b>{ item["C19 Cat"] }: { item["C19 SubCat"] }; Delivery Regions: { item['Delivery Regions'].join(" ") }</b>
                          </div>
                          <TownhallVideoPrezo cutomerName={item.Customer}  videoUrl={item["C19 Video"]} />
                          {item['Description']}
                          <div className="emailColumn">
                            <Button className="emailButton" variant="primary" href={contactString}>Get Introduced to {item.Customer} </Button> 
                          </div>
                      </div>

                    </div>)}
                    )
                  }
            </div>
            <div className="clearfix"></div>
          </div>
          </div>
        </div>
      </div>
    )
  }
}

export default CompanySearch;