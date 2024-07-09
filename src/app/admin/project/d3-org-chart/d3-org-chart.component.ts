import { OnChanges, Component, ViewChild, ElementRef, OnInit, Output, EventEmitter, Input, } from "@angular/core";
import * as d3 from 'd3';
import { OrgChart } from "./orgChart";
import { PieChart } from "./pieChart";
import { jsPDF } from "jspdf";
import { DownloadNotification, D3NodeChangeNotifier } from "src/app/_services/notifier.services";
import { NodeProps } from 'src/app/_models/admin'
/*
  "d3": "7.6.1",
    "d3-flextree": "2.1.2",
    "d3-org-chart": "2.6.0",
*/
/**        "d3": "^5.15.1",
        "d3-org-chart": "^1.0.12",
 */


@Component({
    selector: "app-d3-org-chart",
    templateUrl: "./d3-org-chart.component.html",
    styleUrls: ["./d3-org-chart.component.scss"]
})
export class D3OrgChartComponent implements OnChanges, OnInit {
    @ViewChild("chartContainer", { static: false, read: ElementRef }) chartContainer: ElementRef;
    @Input() Data: any[] = null;
    @Output() OnDropEvent = new EventEmitter<NodeProps>();
    @Output() OnChainDeleteEvent = new EventEmitter<NodeProps>();
    @Input() DisplayType: string = '1';
    @Input() HeightOffset: number = 0;

    chart: OrgChart;
    reName = /NAME/g;
    reDesignation = /DESIGNATION/g;
    reProject = /PROJECT/g;
    constructor(
        private downloadNotifier: DownloadNotification,
        private d3NodeChanger: D3NodeChangeNotifier) { }


    ngOnDestroy() {
        //this.eventsSubscription.unsubscribe();
    }

    ngOnInit() {

        this.downloadNotifier.getData().subscribe(value => {
            if (value === true) {
                this.downloadPdf();
            }
        })

        this.OnDropEvent.subscribe((value) => {
            this.d3NodeChanger.sendDropNodes({
                DropNode: value
            })
        })
        this.OnChainDeleteEvent.subscribe((value) => {
            this.d3NodeChanger.sendDropNodes({
                ChainNode: value
            })

        })
    }

    ngAfterViewInit() {
    }

    UpdateChart() {
        if (!this.chart) {
            this.chart = new OrgChart();
        }
        this.updateChart(this.chart, this.Data);
    }

    ngOnChanges() {
        this.updateChart(this.chart, this.Data);
    }

    updateChart(chart, data, onDropEvent = this.OnDropEvent, onChainDeleteEvent = this.OnChainDeleteEvent) {
        if (!data || data.length == 0) {
            return;
        }
        if (!chart) {
            return;
        }

        const deleteString = this.DisplayType == "2" ? '<div style="float:right; margin-right:20px;margin-top:15px" class="remove-node-chain" > <i class="fa-solid fa-link-slash" aria-hidden="true"></i></div>' : '';


        const url: string = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QMaAyMA1SdmlAAAAVRJREFUeNrt26FOw2AUhuFTElzrETNLMNPtJVRVVFbtlnYXKGQFqldANo3EoLDUITazzCxBTNBk53lv4M+XJ/ndKZ52L9uft9eP+Oeqbtgs8O7+cbWO36/PiIgmwd4ojsdIU9n2l7XzNBYZNj9Eos6oTRbcdMAZAwxYgAVYgAVYgAUYsAALsAALsAALMGABFmABFmABFmABBizAAqwFgZ/fv+slHl7q3aobNpn2proujIgo276ep/HgixZgARZgARZgAQYswAIswAIswAIswIAFWIAFWIAFWIABC7AAC7AAC7D+AHZdeN97XRf6ogVYgAVYgAVYgAELsAALsAALsAADFmABFmABFmABFmDAAizAAizAAqxrYNeF973XdaEvWoAFWIAFWIAFGLAAC7AAC7AACzBgARZgARZgARZgAQYswAIswAKsW0p1m1S2/WXtPI1Fhs0nxU1Jj2yxm2sAAAAASUVORK5CYII=`;
        const replaced = url.replace(/(\r\n|\n|\r)/gm, '');
        this.chart.container(this.chartContainer.nativeElement)
            .svgHeight(window.innerHeight - this.HeightOffset)
            .svgWidth(window.innerWidth - (this.DisplayType == "1" ? 300 : 800))
            .displayType(this.DisplayType)
            .data(data)
            .nodeHeight((d) => 180)
            .nodeWidth((d) => {
                if (d.depth == 0 && this.DisplayType == "1") return 500;
                return 430;
            })
            .childrenMargin((d) => 90)
            .compactMarginBetween((d) => 65)
            .compactMarginPair((d) => 100)
            .neightbourMargin((a, b) => 50)
            .siblingsMargin((d) => 100)
            .buttonContent(({ node, state }) => {
                return `<div style="color:black;border-radius:5px;padding:5px;font-size:10px;margin:auto auto;background-color:#ffffff;border: 1px solid #ff820e;margin-top:14px"> <span style="font-size:9px">${node.children
                    ? `<i class="fas fa-angle-up"></i>`
                    : `<i class="fas fa-angle-down"></i>`
                    }</span> ${node.data._directSubordinates}  </div>`;
            })
            .linkUpdate(function (d, i, arr) {

                d3.select(this)
                    .attr("stroke", (d) =>
                        d.data._upToTheRootHighlighted ? "#fec087" : "#ff820e"
                    )
                    .attr("stroke-width", (d) => (d.data._upToTheRootHighlighted ? 5 : 1));

                if (d.data._upToTheRootHighlighted) {
                    d3.select(this).raise();
                }
            })
            .nodeContent(function (d, i, arr, state) {
                const projectDesc = `
                    <div class="pie-chart-wrapper" style="margin-left:10px;margin-top:5px;width:320px;height: 187px;">
                        &nbsp;
                    </div>`;
                const projectNoDesc = `
                    <div class="pie-chart-wrapper" style="margin-left:10px;margin-top:5px;width:320px;height: 187px;">&nbsp;</div>`;
                let desc = projectNoDesc;

                const reCEO = /^CEO$/gi;
                if (reCEO.test(d.data.name)) {
                    desc = projectDesc;
                }

                const svgStr = `<svg width=150 height=75 style="background-color:transparent">
                    <path d="M 0,15 L15,0 L135,0 L150,15 L150,60 L135,75 L15,75 L0,60" fill="#f3851f" stroke="#f3851f"/>
                </svg>`;


                return `
                    <div class="left-top" style="position:absolute;left:-10px;top:-10px">${svgStr}</div>
                    <div class="right-top" style="position:absolute;right:-10px;top:-10px">${svgStr}</div>
                    <div class="right-bottom" style="position:absolute;right:-10px;bottom:-13px">${svgStr}</div>
                    <div class="left-bottom" style="position:absolute;left:-10px;bottom:-13px">${svgStr}</div>

                    <div draggable="true" style="font-family: inherit; background-color:#ffffff; position:absolute;margin-top:-8px; margin-left:-8px;width:${d.width + 16}px;border-radius:0px;border: 2px solid #ff820e;border-radius: 10px;">
                    ${desc}
                    <div style="color:black;position:absolute;right:15px;top:-20px;font-weight: 600;">
                            <div style="font-size: 15px; color: black; margin-top: 32px;"> ${d.data.designation ? d.data.name : ''}</div>                                              
                            <div style="font-size:15px;color:black">${d.data.roleName}</div>
                            <div style="font-size:10px;">${d.data.designation || ""}</div>
                            <div style="font-size:15px;">
                            ${d.data.projectName ? `<span style="font-size:10px;">Project: ${d.data.projectName}</span>` : ''}
                            </div>
                            <div style="font-size:10px;">
                            ${d.data.clientName ? `<span style="font-size:10px;">Client: ${d.data.clientName}</span>` : ''}
                            </div>
                            <div style="font-size:10px;">
                            ${d.data.clientCompanyName ? `<span style="font-size:10px;">Client Company: ${d.data.clientCompanyName}</span>` : ''}
                            </div>
                            <div style="font-size:10px;">
                            ${d.data.noOfWorkingDays ? `<span style="color:orange;font-size:10px;" data-bs-toggle="tooltip" data-bs-placement="top" title="Working Day">WD: ${d.data.noOfWorkingDays}</span>` : ''}
                          </div>
                          <div style="font-size:10px;">
                            ${d.data.noOfAbsents ? `<span style="color:orange;font-size:10px;" data-bs-toggle="tooltip" data-bs-placement="top" title="Absents">Abs: ${d.data.noOfAbsents}</span>` : ''}
                          </div>
                          <div style="font-size:10px;">
                            ${d.data.noOfLeaves ? `<span style="color:orange;font-size:10px;" data-bs-toggle="tooltip" data-bs-placement="top" title="Leaves">Leaves: ${d.data.noOfLeaves}</span>` : ''}
                          </div>
                          <div style="font-size:10px;">
                            ${d.data.assetCount ? `<span style="color:orange;font-size:10px;" data-bs-toggle="tooltip" data-bs-placement="top" title="Allotted Assets">Assets: ${d.data.assetCount}</span>` : ''}
                          </div>

                            ${d.depth == 0
                        ? `<br/>
                                <div style="max-width:200px;font-size:10px;">
                                <div class="box_remore" style="font-size:10px;"><p>${d.data.projectDescription || ""}</p></div>
                                </div>`
                        : ""
                    }
                        </div>
                        <div style="position:absolute;bottom:0px;width:100%;display:flex">

                            <div style="color:black;margin-left:20px;margin-top:3px;font-size:10px;display:grid;width: 100%;">
                                <svg width=150 height=30> ${d.data.progress
                        .map((h, i) => {
                            return `<rect width=10 x="${i * 12}" height=${h} y=${30 - h} fill="#41b6a6"/>`;
                        })
                        .join("")}
                                </svg>
                                <div style="float:left;font-size:10px;color:black;">Progress</div>
                            </div>

                           ${d.data.parentId != null ? deleteString : ''}
                        </div>
                    </div>
                `;
            })
            .nodeUpdate(function (d, i, arr) {
                d3.select(this)
                    .select(".node-rect")
                    .call(d3.drag().on("start", (envet) => {
                    }))
                    .attr("stroke", (d) =>
                        d.data._highlighted || d.data._upToTheRootHighlighted
                            ? "#fff5b7"
                            : "none" //fec087
                    )
                    .attr(
                        "stroke-width",
                        d.data._highlighted || d.data._upToTheRootHighlighted ? 20 : 1
                    );

                d3.select(this)
                    .select(".remove-node-chain").on("click", (event, d) => {

                        onChainDeleteEvent.emit(d);
                    })

                const pieChartWrapperNode = d3
                    .select(this)
                    .select(".pie-chart-wrapper")
                    .node()
                    ;
                const val = (d.data.name.length * 5) % 100; // Dummy calc
                // General pie chart invokation code

                new PieChart()
                    .data([
                        { key: "plan", color: "#1b8d7e", value: val },
                        { key: "exec", color: "#01f8d7", value: 100 - val }
                    ])
                    .container(pieChartWrapperNode)
                    .svgHeight(180)
                    .svgWidth(280)
                    .marginTop(40)
                    .marginLeft(80)
                    .image(d.data.imageUrl)
                    .backCircleColor("#1F72A7")
                    .defaultFont("Inter")
                    .render();
            })
            .render();
        if (this.DisplayType == "2") {
            this.chart.container(this.chartContainer.nativeElement)
                .onNodeDrop((d) => {
                    onDropEvent.emit(d);
                })
        }
        d3.select(".svg-chart-container")
            .style(
                "background",
                'radial-gradient(circle at center, #04192B 0, #000B0E 100%) url("https://raw.githubusercontent.com/bumbeishvili/coronavirus.davidb.dev/master/glow.png")'
            )
            .style(
                "background-image",
                `url(${replaced}), radial-gradient(circle at center, #ffffff 0, #ffffff 100%)`
            );

    }


    downloadPdf() {
        if (this.chart) {
            this.chart.exportImg({
                full: false,
                save: false,
                scale: 2,
                onLoad: (base64) => {
                    var pdf = new jsPDF('p', 'px', 'a4', true);
                    var img = new Image();
                    img.src = base64;

                    var width = pdf.internal.pageSize.getWidth();
                    var height = pdf.internal.pageSize.getHeight();//595 / 3   --- ((img.height / img.width) * 595) / 3
                    img.onload = function () {
                        pdf.addImage(
                            img,
                            "JPEG",
                            20,
                            60,
                            (img.width / img.height) * width,
                            (img.height / img.width) * height,
                            undefined,
                            'FAST'
                        );
                        pdf.save("org-chart.pdf");
                    };
                }
            });
        }
    }

}

