import React, { Component, createRef } from 'react'
import axios from 'axios';
import $ from 'jquery';
import './styles.css';
import "./chatContent.css";
import ApexCharts from 'react-apexcharts';
import { chartOption, DataLoading } from './common.js';
import TableScrollbar from 'react-table-scrollbar';
import Lottie from 'react-lottie';
import animationData from './animations/nographdata.json';
import alertTemp from './animations/alert_lottie/alert_temp.json';
import alertHumi from './animations/alert_lottie/alert_humidity.json';
import alertEnergy from './animations/alert_lottie/alert_energy.json';

export default class Home extends Component {
  messagesEndRef = createRef(null);
  ref = createRef(null);
  constructor() {
    super();
    this.state = {
      flag: false,
      livestream: "",
      chatItem: [],
      alerts: [],
      loading: true,
      loading1: false,
      msg: "",
      currDate: new Date().toString().substring(4, 10),
      series: [],
      chartColor: [],
      error: false,
      message: '',
      series1: [],
      graphData: [],
      rackid: "5a-c2-15-07-00-04",
      jsonData1: {
        id: "---",
        location: "---",
        name: "---",
        placedInName: "---",
        tagid: "---",
        placedInMacid: "---",
        datacenter: '---',
        address: '---',
        manufacturer: '---',
        supplier: '---',
        lastmaintenancestaff: '---',
        maintenancecycle: '---',
        maintenancecontact: '---',
        voltage: "0.00",
        energy: "0.00",
        current: "0.00",
        power: "0.00",
        highpowerevent: "0.00",
        coldspot: "0.00",
        hotspot: "0.00",
        tempf: "0.00",
        tempb: "0.00",
        humidityf: "0.00",
        humidityb: "0.00",
      },
    };
  }


  chart_Option = async (graphColor) => {
    this.setState({ chartColor: graphColor });
    let value = await chartOption(graphColor, "yyyy-MM-dd HH:mm");
    this.options = value;
  }

  componentDidMount() {
    this.setState({ flag: true });
    $('.alertdiv').hide();
    $("#opt0").css({ "background": "#00629B", "color": "white" });
    this.assetData("asset")
    this.radioBtnChange("asset", "1");
    this.getMessage();
    this.getImages();
    this.interval = setInterval(() => {
      this.assetData("asset");
    }, 15 * 1000);

    this.interval1 = setInterval(() => {
      this.getImages();
    }, 3 * 1000);

  }


  componentWillUnmount() {
    clearInterval(this.interval);
    clearInterval(this.interval1);
    clearInterval(this.interval2);
    clearInterval(this.interval3);
  }

  getMessage = () => {
    axios({ method: "GET", url: "/api/chat" })
      .then((res) => {
        console.log("getMessage Res====>", res);
        if (res.status === 200) {
          let data = res.data;
          if (data.length !== 0) {
            this.setState({ chatItem: data })
            setTimeout(() => {
              this.scrollToBottom();
            }, 1 * 1000);
          }
        }
      })
      .catch((error) => {
        console.log("Error=====>", error);
      })
  }

  onStateChange = (e) => {
    this.setState({ msg: e.target.value });
  };

  scrollToBottom = () => {
    this.messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  sendingMsg = () => {
    if (this.state.msg !== "") {
      axios({ method: "POST", url: "/api/chat", data: { message: this.state.msg } })
        .then((res) => {
          console.log("SendMsg Response====>", res);
          if (res.status === 200) {
            let data = res.data;
            if (data.length !== 0) {
              this.setState({ msg: "", chatItem: data });
              setTimeout(() => {
                this.scrollToBottom();
              }, 300);
            }
          }
        })
        .catch((error) => {
          console.log("Error=====>", error);
        })
    }
  }

  deleteMsg = (id) => {
    console.log(id)
    $("#chat" + id).addClass("chat__itemDelete");
    setTimeout(() => {
      $("#chat_container > div").removeClass("chat__itemDelete");
      axios({ method: "DELETE", url: "/api/chat", data: { id: id } })
        .then((res) => {
          console.log("DELETE Response------>", res);
          if (res.status === 200) {
            let data = res.data;
            this.setState({ chatItem: data });
          }
        })
        .catch((error) => {
          console.log("Error=====>", error);
        })
    }, 1 * 1000);

  }

  getImages = () => {
    clearInterval(this.interval3);
    axios({ method: "GET", url: "/api/alert/image" })
      .then((res) => {
        console.log("Image Response------>", res);
        if (res.status === 200) {
          let data = res.data;
          $("#cameraTime").text(data.timeStamp.replace("T", " "))
          $("#cameraImage").attr("src", data.image);
          $("#maxImage").attr("src", data.image);
          $("#maxcamTime").text(data.timeStamp.replace("T", " "))
        }
      })
      .catch((error) => {
        console.log("Error=====>", error);
      })
  }

  assetData = (asset) => {
    $("#img_container .assets").remove();
    $("#rackheader").text("Rack : " + this.state.rackid);
    $("#rackImg").attr("src", "../images/mainframe.png");
    $("#rackImg").css({ "width": "200px", "height": "522px" });
    let incValue = 0;
    for (let i = 42; i >= 1; i--) {
      let assetDiv = document.createElement("div");
      $(assetDiv).attr("id", "asset_" + i);
      $(assetDiv).attr("class", "assets");
      $(assetDiv).css({
        "width": "175px",
        "height": "9px",
        "position": "absolute",
        // "background": "rgba(16,255,0,0.6)",
        "left": "12px",
        "top": (13 + incValue).toString() + "px",
      });
      $("#img_container").append(assetDiv);
      incValue += 12;
    }
    axios({ method: "GET", url: "/api/rack/average?id=" + this.state.rackid + "&&key=" + asset })
      .then((response) => {
        let dt = response.data;
        console.log("Asset Pilot Res===>", dt)
        if (dt.length !== 0) {
          let assetDt = dt.data;
          if (assetDt.length !== 0) {
            this.redirect(assetDt[0].alert, assetDt[0].asset.id)
            for (let i = 0; i < assetDt.length; i++) {
              if (assetDt[i].asset.location !== null) {
                $("#asset_" + assetDt[i].asset.location).css({
                  "background": "rgba(0, 153, 255,0.8)",
                  "cursor": "pointer"
                });
                $("#asset_" + assetDt[i].asset.location).attr("title",
                  "AssetName : " + assetDt[i].asset.name +
                  "\nAssetID : " + assetDt[i].asset.tagid +
                  "\nLocation : U" + assetDt[i].asset.location +
                  "\nLastSeen : " + assetDt[i].asset.lastseen.substring(0, 19).replace("T", " "));
                if (assetDt[i].alert.length > 0) {
                  $("#asset_" + assetDt[i].asset.location).css("animation", "blink 1s linear infinite");
                }
                $("#asset_" + assetDt[i].asset.location).on("click", () => this.redirect(assetDt[i].alert, assetDt[i].asset.id))
              }
            }
          } else {
            $("#img_container").css("margin-top", "20px");
          }
        }
      })
      .catch((error) => {
        console.log("Asset Pilot Error====>", error)
      })

  }

  redirect = (jsonData, id) => {
    let alertData = [];
    if (jsonData.length !== 0) {
      if (jsonData.length === 1) {
        $('.alertdiv').css("margin-top", "-3px");
      } else if (jsonData.length === 2) {
        $('.alertdiv').css("margin-top", "-30px");
      } else if (jsonData.length === 3) {
        $('.alertdiv').css("margin-top", "-45px");
      }
      $('.alertdiv').show();
      for (let i = 0; i < jsonData.length; i++) {
        if (jsonData[i].value === 8) {
          alertData.push({ id: 3, value: 8, type: "Temperature", animData: alertTemp, color: 'red' })
        } else if (jsonData[i].value === 9) {
          alertData.push({ id: 4, value: 9, type: "Humidity", animData: alertHumi, color: 'blue' })
        } else if (jsonData[i].value === 10) {
          alertData.push({ id: 5, value: 10, type: "Energy", animData: alertEnergy, color: 'orange' })
        }
      }
      this.setState({ alerts: alertData })
    } else {
      $("#img_container").css("margin-top", "20px !important");
      $('.alertdiv').hide();
    }

    axios({ method: 'GET', url: '/api/asset?id=' + id })
      .then((response) => {
        console.log("Asset History Res===>", response)
        let data = response.data
        if (data.length !== 0 && response.status === 200) {
          if (data.length !== 0) {
            this.setState({
              jsonData1: {
                id: id,
                location: data.location,
                name: data.name,
                placedInName: data.placedIn.name,
                tagid: data.tagid,
                placedInMacid: data.placedIn.macid,
                datacenter: data.datacenter.length > 0 ? data.datacenter : '---',
                address: data.address.length > 0 ? data.address : '---',
                manufacturer: data.manufacturer.length > 0 ? data.manufacturer : '---',
                supplier: data.supplier.length > 0 ? data.supplier : '---',
                maintenancecycle: data.maintenancecycle.length > 0 ? data.maintenancecycle : '---',
                lastmaintenancestaff: data.lastmaintenancestaff.length > 0 ? data.lastmaintenancestaff : '---',
                maintenancecontact: data.maintenancecontact.length > 0 ? data.maintenancecontact : '---',
                voltage: data.voltage > 0 ? data.voltage.toFixed(2) : "0.00",
                energy: data.energy > 0 ? (data.energy / 1000).toFixed(2) : "0.00",
                current: data.current > 0 ? data.current.toFixed(2) : "0.00",
                power: data.power > 0 ? data.power.toFixed(2) : "0.00",
                highpowerevent: data.highpowerevent > 0 ? data.highpowerevent : "0.00",
                coldspot: data.coldspot > 0 ? data.coldspot.toFixed(2) : "0.00",
                hotspot: data.hotspot > 0 ? data.hotspot.toFixed(2) : "0.00",
                tempf: data.tempf > 0 ? data.tempf.toFixed(2) : "0.00",
                tempb: data.tempb > 0 ? data.tempb.toFixed(2) : "0.00",
                humidityf: data.humidityf > 0 ? data.humidityf.toFixed(2) : "0.00",
                humidityb: data.humidityb > 0 ? data.humidityb.toFixed(2) : "0.00",
              }
            });
          }
        } else {
          this.setState({ message: 'No Data Found' })
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }

  graphData = (asset) => {
    axios({ method: "GET", url: "/api/rack/average?id=" + this.state.rackid + "&&key=" + asset })
      .then((response) => {
        console.log(asset, "Graph Res===>", response);
        if (response.status === 200 || response.status === 201) {
          let dt = response.data;
          let dtGraph = dt.graph;
          if (dtGraph.length !== 0) {
            let occupancy = [], tempF = [], tempB = [], humiF = [], humiB = [], energy = [];
            if (asset === "asset") {
              $('#text').html('')
              this.chart_Option(["#0000ff"]);
              for (let i = 0; i < dtGraph.length; i++) {
                let time = dtGraph[i].time.substring(0, 19).replace("T", " ");
                let date = new Date(time);
                let ms = date.getTime();
                occupancy.push([ms, dtGraph[i].count]);
              }
              this.setState({
                series: [
                  { name: 'Occupancy', data: occupancy },
                ],
                loading: false,
              });
              // $('#text').html('Capacity Graph')
            } else if (asset === "thermal") {
              $('#text').html('')
              this.chart_Option(["#ff1a1a", "#ff9900", "#00b386", "#009933"]);
              this.setState({ series: [] })
              for (let i = 0; i < dtGraph.length; i++) {
                let time = dtGraph[i].time;
                let date = new Date(time);
                let ms = date.getTime();
                tempF.push([ms, dtGraph[i].tempf.toFixed(0)]);
                tempB.push([ms, dtGraph[i].tempb.toFixed(0)]);
                humiF.push([ms, dtGraph[i].humidityf.toFixed(0)]);
                humiB.push([ms, dtGraph[i].humidityb.toFixed(0)]);
              }
              this.setState({
                series: [
                  { name: 'Temp(F)(°C)', data: tempF },
                  { name: 'Temp(B)(°C)', data: tempB },
                  { name: 'Humi(F)(RH)', data: humiF },
                  { name: 'Humi(B)(RH)', data: humiB },
                ],
                loading: false,
              });
              // $('#text').html('Thermal Graph')
            } else if (asset === "energy") {
              this.chart_Option(["#6600cc"]);
              $('#text').html('')
              for (let i = 0; i < dtGraph.length; i++) {
                let time = dtGraph[i].time;
                let date = new Date(time);
                let ms = date.getTime();
                energy.push([ms, dtGraph[i].energy.toFixed(0)]);
              }
              this.setState({
                series: [{ name: 'Energy(kWh)', data: energy }], loading: false
              });
              // $('#text').html('Energy Graph')
            }
          } else {
            $("#graphAnime").show();
            this.setState({ series: [], loading: false });
          }
        }
        else {
          this.setState({ series: [], loading: false })
          // $('#text').val('')
        }
      })
      .catch((error) => {
        $("#graphAnime").show();
        this.setState({ series: [], loading: false })
        console.log("Graph Res===>", error)
      })
  }

  radioBtnChange = (asset, id) => {
    this.setState({ series: [], loading: true });
    clearInterval(this.interval2);
    $("#graphAnime").hide();
    $(".myDIV").parent().find('input').removeClass("active");
    this.setState({ flag: true });
    $("#" + id).addClass("active");
    this.graphData(asset);
    this.interval2 = setInterval(() => {
      this.graphData(asset);
    }, 1 * 60 * 1000);

  }

  show = (key, id, name) => {
    console.log(key, id, name)
    $('#slide').show()
    $("#slide").animate({ "right": "0px" }, "slow");
    $("#graphHeader").text(name);
    this.setState({ error: false, message: "", series1: [], loading1: true });
    $(".box").hide();
    axios({ method: 'GET', url: '/api/asset/event?id=' + id + "&key=" + key })
      .then((response) => {
        console.log("Responsegraph=====>", response);
        let data = response.data;
        if (response.status === 200) {
          if (data.length !== 0) {
            this.chart_Option(["#0000ff"]);
            let graphData = [], graphName = name;
            for (let i = 0; i < data.length; i++) {
              let time = data[i].lastseen.substring(0, 19).replace("T", " ");
              let date = new Date(time);
              let ms = date.getTime();
              if (name === "Energy(kWh)") {
                graphName = name
                graphData.push([ms, data[i].energy_diff.toFixed(0)]);
              } else if (name === "Temperature Front(°C)") {
                graphName = name
                graphData.push([ms, data[i].tempf.toFixed(0)]);
              } else if (name === "Temperature Back(°C)") {
                graphName = name
                graphData.push([ms, data[i].tempb.toFixed(0)]);
              } else if (name === "Humidity Front(RH)") {
                graphName = name
                graphData.push([ms, data[i].humidityf.toFixed(0)]);
              } else if (name === "Humidity Back(RH)") {
                graphName = name
                graphData.push([ms, data[i].humidityb.toFixed(0)]);
              } else if (name === "Voltage(V)") {
                graphName = name
                graphData.push([ms, data[i].voltage.toFixed(0)]);
              } else if (name === "Current(A)") {
                graphName = name
                graphData.push([ms, data[i].current.toFixed(0)]);
              } else if (name === "Power Factor") {
                graphData.push([ms, data[i].power.toFixed(0)]);
              } else if (name === "High-Power") {
                graphData.push([ms, data[i].eventValue]);
              }
            }
            this.setState({
              series1: [
                { name: graphName, data: graphData }
              ],
              loading1: false,
            });
          } else {
            this.setState({ series: [], loading1: false, })
          }
        }
      })
      .catch((error) => {
        console.log("error===>", error);
        if (error.response.status === 403) {
          this.setState({ loading: false })
          $("#displayModal").css("display", "block");
        } else if (error.response.status === 400) {
          this.setState({ error: true, message: 'Bad Request!' })
        } else if (error.response.status === 404) {
          $("#temp").children("div").remove();
          this.setState({ error: true, message: 'No Data Found!', loading1: false, })
        }
      });
  }

  uLocation = (key, id) => {
    $("#graphHeader").text("U-Location");
    $('#slide').show()
    $("#slide").animate({ "right": "0px" }, "slow");
    this.setState({ error: false, message: "", series1: [] });
    $(".box").show();
    axios({ method: 'GET', url: '/api/asset/event?id=' + id + "&key=" + key })
      .then((response) => {
        console.log("Response==------===>", response);
        let data = response.data;
        $("#table_det tbody").empty();
        $("#table_det thead").empty();
        if (response.status === 200) {
          $("#table_det thead").append(
            "<tr>" +
            "<th>SNO</th>" +
            "<th>RACK NAME</th>" +
            "<th>LOCATION</th>" +
            "<th>START TIME</th>" +
            "<th>END TIME</th>" +
            "<th>DURATION</th>" +
            "</tr>"
          );
          if (data.length !== 0) {
            for (let i = 0; i < data.length; i++) {
              let startTime = data[i].startTime.replace("T", " ").substr(0, 19);
              let endTime = data[i].endTime.replace("T", " ").substr(0, 19);
              let diff = (new Date(endTime) - new Date(startTime)) / 1000;
              let hh = Math.floor(diff / 3600);
              if (hh < 10) hh = "0" + hh;
              let mm = Math.floor((diff % 3600) / 60);
              if (mm < 10) mm = "0" + mm;
              let ss = Math.floor((diff % 3600) % 60);
              if (ss < 10) ss = "0" + ss;
              let duration = hh + ":" + mm + ":" + ss;
              $("#table_det tbody").append(
                "<tr>" +
                "<td>" + (i + 1) + "</td>" +
                "<td>" + data[i].rack.name + "</td>" +
                "<td>" + data[i].location + "</td>" +
                "<td>" + data[i].startTime.replace("T", " ").substr(0, 19) + "</td>" +
                "<td>" + data[i].endTime.replace("T", " ").substr(0, 19) + "</td>" +
                "<td>" + duration + "</td>" +
                "</tr>"
              )
            }
          } else {
            $(".box").css("height", "auto");
            this.setState({ error: true, message: 'No Data Found!' })
          }
        }
      })
      .catch((error) => {
        console.log("error===>", error);
        if (error.response.status === 403) {
          this.setState({ loading: false })
          $("#displayModal").css("display", "block");
        } else if (error.response.status === 400) {
          this.setState({ error: true, message: 'Bad Request!' })
        } else if (error.response.status === 404) {
          $("#temp").children("div").remove();
          this.setState({ error: true, message: 'No Data Found!' })
        }
      });
  }
  maximize = () => {
    $("#parentdiv").hide();
    $("#maximg").show("slow");
    /* axios({ method: "GET", url: "/api/alert/image"})
    .then((res) => {
      console.log("Image Response------>", res);
      if (res.status === 200) {
        let data = res.data;
        $("#maxcamTime").text(data.timeStamp.replace("T", " "))
        $("#maxImage").attr("src", data.image);
      }
    })
    .catch((error) => {
      console.log("Error=====>", error);
    }) */
  }
  render() {
    const { chartColor, series, jsonData1,
      error, message, series1, alerts,
      loading, chatItem, currDate } = this.state;
    return (
      <div id="parent" style={{
        background: '#E5EEF0',
        width: '100%', height: '100vh',
      }}>

        <div style={{ display: "flex" }}>
          <img src='/images/vlogo.png' className='logo' alt="" />
        </div>
        <div style={{ margin: '40px', marginTop: '25px' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ width: '250px', height: '50vh' }}>
              {/*<div
                id="rackheader"
                className='header'
                style={{ fontSize: "17px", marginBottom: "10px" }}>
              </div> */}
              <div className='alertdiv'>
                <div className='alertdiv_header'>
                  <span style={{ color: 'white', fontWeight: 700 }}>Alerts</span>
                </div>
                {alerts.length !== 0 &&
                  (alerts.map((item, index) => (
                    <div key={index}
                      style={{
                        marginTop: "4px", display: "flex",
                        alignItems: "center"
                      }}>
                      <Lottie
                        options={{
                          loop: true,
                          autoplay: true,
                          animationData: item.animData,
                          rendererSettings: {
                            preserveAspectRatio: 'xMidYMid slice'
                          }
                        }}
                        style={{ margin: "0", marginLeft: "30px" }}
                        width={18}
                        height={18}
                      />
                      <span style={{
                        fontWeight: '700',
                        fontSize: "13px",
                        color: "#6e737e",
                        marginTop: "-4px",
                        marginLeft: "5px",
                        display: 'inline-block',
                      }}>{item.type}</span>
                    </div>
                  )))
                }
              </div>
              <div id="img_container">
                <img id="rackImg" style={{ position: "absolute", }} alt="" />
              </div>
            </div>

            <div id='parentdiv' style={{ position: 'relative' }}>
              <div className='maindiv' style={{ marginBottom: '10px' }}>
                <div className='card1' style={{ position: 'relative' }}>
                  <span className='header'>Camera</span> <br />
                  <span
                    id="expandIcon"
                    title='Maximize'
                    style={{ position: 'absolute', right: '30px', top: '35px' }} onClick={this.maximize}>
                    <i className="fas fa-expand" style={{ fontSize: '24px', color: 'black', cursor: 'pointer' }}></i>
                  </span>
                  <span id="cameraTime"
                    style={{
                      background: 'white',
                      fontWeight: "700", fontSize: "13px", borderRadius: '5px',
                      color: "#000",
                      position: "absolute", float: 'right', padding: '3px', margin: '5px'
                    }}></span>
                  <img id="cameraImage"
                    style={{
                      width: "470px",
                      height: "230px",
                      objectFit: "fill",
                      borderRadius: "10px",
                    }}
                    alt="" />
                  <br />


                </div>
                <div className='card2'>
                  <span className='header'>Comment History</span>
                  <div className="main__chatcontent">
                    <div className="content__body">
                      <div className="chat__items">
                        {
                          chatItem.map((items, ind) => (
                            <div key={ind} id="chat_container">
                              <div id="chatdate">{items.date}</div>
                              {items.date !== currDate ? (
                                items.data.map((datas, index) => (
                                  <div
                                    key={index}
                                    id={"chat" + datas.id}
                                    style={{ animationDelay: `0.5s` }}
                                    className="chat__item other">
                                    <div className="chat__item__content">
                                      <div className="chat__msg">{datas.message}</div>
                                      <div className="chat__meta">
                                        <span>{datas.timestamp.substring(11, 19)}</span>
                                      </div>
                                    </div>
                                    <div id="deleteIcon" onClick={() => this.deleteMsg(datas.id)}>
                                      <i className="fas fa-trash-alt"></i>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                items.data.map((datas, index) => (
                                  <div
                                    key={index}
                                    id={"chat" + datas.id}
                                    style={{ animationDelay: `0.5s` }}
                                    className="chat__item">
                                    <div className="chat__item__content">
                                      <div className="chat__msg">{datas.message}</div>
                                      <div className="chat__meta">
                                        <span>{datas.timestamp.substring(11, 19)}</span>
                                      </div>
                                    </div>
                                    <div id="deleteIcon" onClick={() => this.deleteMsg(datas.id)}>
                                      <i className="fas fa-trash-alt"></i>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          ))
                        }
                        <div id="messageEnd" ref={this.messagesEndRef} />
                      </div>
                    </div>
                    <div className="content__footer">
                      <div className="sendNewMessage">
                        <input
                          type="text"
                          placeholder="Type a message here"
                          onChange={this.onStateChange}
                          value={this.state.msg}
                        />
                        <button className="btnSendMsg"
                          onClick={() => this.sendingMsg()}
                          id="sendMsgBtn">
                          <i className="fa fa-paper-plane"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='maindiv'>
                <div className='card1'>
                  <span className='header'>Rack Details</span>
                  <div style={{
                    display: "flex", marginTop: '5px',
                    justifyContent: 'space-around'
                  }}>
                    <div className='myDIV'>
                      <input value="Asset" type="button" id="1" className="fancy-button active"
                        onClick={() => this.radioBtnChange("asset", "1")} />
                    </div>
                    <div className='myDIV'>
                      <input value="Thermal" type="button" id="2" className="fancy-button"
                        onClick={() => this.radioBtnChange("thermal", "2")} />
                    </div>
                    <div className='myDIV'>
                      <input value="Energy" type="button" id="3" className="fancy-button"
                        onClick={() => this.radioBtnChange("energy", "3")} />
                    </div>
                  </div>

                  {loading === true && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "10%",
                        left: "20%"
                      }} className="frame">
                      <DataLoading />
                    </div>
                  )}
                  {/* <span id='text'></span> */}

                  {series.length > 0 ? (
                    <div id="chart" style={{
                      marginTop: "0px",
                      borderRadius: "10px", height: "35vh"
                    }}>
                      <div id="chart-timeline">
                        {this.options !== undefined && (
                          <ApexCharts options={{
                            chart: {
                              id: "area-datetime",
                              type: "area",
                              height: 380,
                              curve: "smooth",
                              zoom: {
                                autoScaleYaxis: true,
                              },
                              animations: {
                                enabled: true,
                                easing: "easeinout",
                                speed: 500,
                                animateGradually: {
                                  enabled: true,
                                  delay: 500,
                                },
                                dynamicAnimation: {
                                  enabled: true,
                                  speed: 500,
                                },
                              },
                            },
                            stroke: {
                              width: 2,
                            },
                            dataLabels: {
                              enabled: false,
                            },
                            markers: {
                              size: 0,
                            },
                            xaxis: {
                              type: "datetime",
                              tickAmount: 1,
                              labels: {
                                datetimeUTC: false,
                              },
                            },
                            tooltip: {
                              x: {
                                format: "yyyy-MM-dd HH:mm",
                              },
                            },
                            colors: chartColor,
                          }}
                            series={series}
                            height={200}
                            width={480}
                          />
                        )}
                      </div>
                    </div>
                  ) : (null)}
                  <div
                    style={{
                      width: "80%",
                      height: "30vh",
                      border: "1px solid #d5d5d5",
                      margin: "10px 40px",
                      textAlign: "center"
                    }}
                    id="graphAnime">
                    <h4 style={{ textAlign: "center", color: "red", marginTop: "0px" }}>
                      No Graph Data Found!
                    </h4>
                    <Lottie
                      options={{
                        loop: true,
                        autoplay: true,
                        animationData: animationData,
                        rendererSettings: {
                          preserveAspectRatio: 'xMidYMid slice'
                        }
                      }}
                      width={240}
                      height={200}
                      style={{
                        position: "relative",
                        margin: "-8% 0px 0px 12%",
                        padding: "0"
                      }}
                    />
                  </div>
                </div>
                <div className='card2'
                  style={{ position: 'relative', overflow: "hidden" }}>
                  <span className='header'>Server Details</span>
                  <div className='childselect'
                    style={{
                      marginTop: "8px", display: 'flex',
                      marginLeft: '20px', textAlign: 'left', fontSize: '20px'
                    }}>
                    <div style={{ width: "215px" }}>
                      <div>
                        <span style={{ width: '80px' }}>Asset ID </span>
                        <span> : &nbsp;
                          {jsonData1.tagid}
                        </span>
                      </div>
                      <div>
                        <span style={{ width: '80px' }}>Rack ID </span>
                        <span> : &nbsp;
                          {jsonData1.placedInMacid}
                        </span>
                      </div>
                      <div>
                        <span style={{ width: '80px' }}>Asset Name </span>
                        <span> : &nbsp;
                          {jsonData1.name}
                        </span>
                      </div>
                      <div>
                        <span style={{ width: '80px' }}>Rack Name </span>
                        <span> : &nbsp;
                          {jsonData1.placedInName}
                        </span>
                      </div>
                      <div>
                        <span style={{ width: '80px' }}>U-Location </span>
                        {jsonData1.location !== "---" ? (<span> : {jsonData1.location}<i style={{ marginLeft: "5px", cursor: "pointer" }}
                          onClick={() => this.uLocation("location", jsonData1.id)}
                          className="fas fa-plus-circle"></i></span>) : <span> : &nbsp;{jsonData1.location}</span>}
                      </div>
                      <div>
                        <span style={{ width: '80px' }}>Voltage(V) </span>
                        {jsonData1.voltage !== "0.00" ? (
                          <span> : {jsonData1.voltage}<i style={{ marginLeft: "5px", cursor: "pointer" }}
                            onClick={() => this.show("voltage", jsonData1.id, "Voltage(V)")}
                            className="fas fa-plus-circle"></i></span>) : <span> : &nbsp;{jsonData1.voltage}</span>}
                      </div>
                      <div>
                        <span style={{ width: '80px' }}>Energy(kWh) </span>
                        {jsonData1.energy !== "0.00" ? (
                          <span> : {jsonData1.energy}<i style={{ marginLeft: "5px", cursor: "pointer" }}
                            onClick={() => this.show("energy", jsonData1.id, "Energy(kWh)")}
                            className="fas fa-plus-circle"></i></span>) : <span> : &nbsp;{jsonData1.energy}</span>}
                      </div>
                      <div>
                        <span style={{ width: '80px' }}>Current(A) </span>
                        <span> : &nbsp;
                          {jsonData1.current !== "0.00" ? (<>
                            {jsonData1.current} <i style={{ marginLeft: "5px", cursor: "pointer" }}
                              onClick={() => this.show("current", jsonData1.id, "Current(A)")}
                              className="fas fa-plus-circle"></i></>) : jsonData1.current}
                        </span>
                      </div>
                    </div>
                    <div style={{ marginLeft: '40px' }}>
                      <div>
                        <span style={{ width: '145px' }}>Power Factor </span>
                        <span> : &nbsp;
                          {jsonData1.power !== "0.00" ? (<>
                            {jsonData1.power}<i style={{ marginLeft: "5px", cursor: "pointer" }}
                              onClick={() => this.show("power", jsonData1.id, "Power Factor")}
                              className="fas fa-plus-circle"></i></>) : (jsonData1.power)}
                        </span>
                      </div>
                      <div>
                        <span style={{ width: '145px' }}>High-Power </span>
                        <span> : &nbsp;
                          {jsonData1.highpowerevent !== "0.00" ? (
                            <>{jsonData1.highpowerevent}<i style={{ marginLeft: "5px", cursor: "pointer" }}
                              onClick={() => this.show(3, jsonData1.id, "High-Power")}
                              className="fas fa-plus-circle"></i></>) : jsonData1.highpowerevent}
                        </span>
                      </div>
                      <div>
                        <span style={{ width: '145px' }}>Coldspot </span>
                        <span> : &nbsp;
                          {jsonData1.coldspot !== "0.00" ? (
                            <>{jsonData1.coldspot}<i style={{ marginLeft: "5px", cursor: "pointer" }}
                              onClick={() => this.show(2, jsonData1.id, "Coldspot")}
                              className="fas fa-plus-circle"></i></>) : jsonData1.coldspot}
                        </span>
                      </div>
                      <div>
                        <span style={{ width: '145px' }}>Hotspot </span>
                        <span> : &nbsp;
                          {jsonData1.hotspot !== "0.00" ? (
                            <>{jsonData1.hotspot}<i style={{ marginLeft: "5px", cursor: "pointer" }}
                              onClick={() => this.show(1, jsonData1.id, "Hotspot")}
                              className="fas fa-plus-circle"></i></>) : jsonData1.hotspot}
                        </span>
                      </div>
                      <div>
                        <span style={{ width: '145px' }}>Temperature Front(°C) </span>
                        <span> : &nbsp;
                          {jsonData1.tempf !== "0.00" ? (
                            <>{jsonData1.tempf}<i style={{ marginLeft: "5px", cursor: "pointer" }}
                              onClick={() => this.show("tempf", jsonData1.id, "Temperature Front(°C)")}
                              className="fas fa-plus-circle"></i></>) : jsonData1.tempf}
                        </span>
                      </div>
                      <div>
                        <span style={{ width: '145px' }}>Temperature Back(°C) </span>
                        <span> : &nbsp;
                          {jsonData1.tempb !== "0.00" ? (
                            <>{jsonData1.tempb}<i style={{ marginLeft: "5px", cursor: "pointer" }}
                              onClick={() => this.show("tempb", jsonData1.id, "Temperature Back(°C)")}
                              className="fas fa-plus-circle"></i></>) : jsonData1.tempb}
                        </span>
                      </div>
                      <div>
                        <span style={{ width: '145px' }}>Humidity Front(RH) </span>
                        <span> : &nbsp;
                          {jsonData1.humidityf !== "0.00" ? (
                            <>{jsonData1.humidityf}<i style={{ marginLeft: "5px", cursor: "pointer" }}
                              onClick={() => this.show("humidityf", jsonData1.id, "Humidity Front(RH)")}
                              className="fas fa-plus-circle"></i></>) : jsonData1.humidityf}
                        </span>
                      </div>
                      <div >
                        <span style={{ width: '145px' }}>Humidity Back(RH) </span>
                        <span> : &nbsp;
                          {jsonData1.humidityb !== "0.00" ? (
                            <>{jsonData1.humidityb}<i style={{ marginLeft: "5px", cursor: "pointer" }}
                              onClick={() => this.show("humidityb", jsonData1.id, "Humidity Back(RH)")}
                              className="fas fa-plus-circle"></i></>) : jsonData1.humidityb}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div id='slide'>
                    <span onClick={() => {
                      $("#slide").animate({ "right": "-30vw" }, "slow")
                      setTimeout(() => {
                        $("#slide").hide();
                      }, 500);
                    }}>
                      <i className="fas fa-times-circle"
                        style={{
                          fontSize: '20px', float: 'right', padding: '10px',
                          color: 'red', cursor: 'pointer'
                        }}></i></span>
                    <div style={{ padding: '10px', paddingBottom: "0px" }}></div>
                    <div>
                      <span id="graphHeader" style={{
                        color: '#00629B', marginLeft: "20px",
                        fontSize: '22px', fontWeight: 700
                      }}></span>
                      <div className="box" style={{ width: "98.3%", height: "34vh", }}>
                        <TableScrollbar>
                          <table style={{ width: "95%" }} id="table_det">
                            <thead style={{ fontSize: "12px" }}></thead>
                            <tbody style={{ fontSize: "12px" }}></tbody>
                          </table>
                        </TableScrollbar>
                      </div>
                      {error && (
                        <div
                          style={{ marginLeft: "30px", marginBottom: "-20px", color: "red" }}>
                          <strong>{message}</strong>
                        </div>
                      )}
                      {series1.length > 0 ? (
                        <div id="chart" style={{
                          borderRadius: "10px", height: "60vh"
                        }}>
                          <div id="chart-timeline">
                            {this.options !== undefined && (
                              <ApexCharts options={this.options}
                                series={series1}
                                type="area"
                                height={230} />
                            )}
                          </div>
                        </div>
                      ) : (null)}
                    </div>
                  </div>
                </div>
              </div>

            </div>
            <div id='maximg'
              style={{
                position: 'absolute', background: 'white',
                left: '21%', display: 'none',
                width: '1030px', height: '570px', borderRadius: '10px'
              }}>
              <span id="maxcamTime"
                style={{
                  background: 'white',
                  fontWeight: "700", fontSize: "13px", borderRadius: '5px',
                  color: "#000",
                  position: "absolute", float: 'right', padding: '3px', margin: '5px'
                }}></span>
              <span style={{ right: '7px', position: 'absolute', top: '7px' }}
              title="Minimize"
                onClick={() => {
                  $("#parentdiv").show();
                  $("#maximg").hide("slow");
                }}
              >

                <i className="fas fa-times-circle" style={{ fontSize: '24px', cursor: 'pointer' }}></i>
              </span>
              <br />
              <img id="maxImage"
                style={{
                  width: "1030px",
                  height: "570px",
                  objectFit: "fill",
                  borderRadius: "10px",
                  marginTop: '-22px'
                }}
                alt="" />
            </div>

          </div>
        </div>
      </div>
    )
  }
}
