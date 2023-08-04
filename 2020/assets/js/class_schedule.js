var class_schedule = [
    {
        "classname": "虚拟现实",
        "time": [
            {
                "week": [
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15
                ],
                "day": 1,
                "index": 2
            },
            {
                "week": [
                    14,
                    15
                ],
                "day": 1,
                "index": 3
            },
            {
                "week": [
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15
                ],
                "day": 4,
                "index": 4
            }
        ]
    },
    {
        "classname": "多媒体编程基础",
        "time": [
            {
                "week": [
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15,
                    16
                ],
                "day": 2,
                "index": 2
            },
            {
                "week": [
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15,
                    16
                ],
                "day": 3,
                "index": 5
            },
            {
                "week": [
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15,
                    16
                ],
                "day": 4,
                "index": 2
            }
        ]
    },
    {
        "classname": "人工智能",
        "time": [
            {
                "week": [
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15,
                    16,
                    17
                ],
                "day": 2,
                "index": 3
            },
            {
                "week": [
                    9,
                    10,
                    11,
                    12,
                    13,
                    14
                ],
                "day": 3,
                "index": 3
            },
            {
                "week": [
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15,
                    16,
                    17
                ],
                "day": 4,
                "index": 3
            }
        ]
    }
];

function getWeekOfYear() {
    var today = new Date();
    var firstDay = new Date(today.getFullYear(), 0, 1);
    var dayOfWeek = firstDay.getDay();
    var spendDay = 1;
    if (dayOfWeek != 0) {
        spendDay = 7 - dayOfWeek + 1;
    }
    firstDay = new Date(today.getFullYear(), 0, 1 + spendDay);
    var d = Math.ceil((today.valueOf() - firstDay.valueOf()) / 86400000);
    var result = Math.ceil(d / 7);
    return result + 1;
};

function putClassSchedule() {
    var classscheduleTable = document.getElementById("classschedule");
    var Nowdate = new Date();
    classscheduleTable.rows[0].cells[0].innerText = (Nowdate.getMonth() + 1) + "/" + Nowdate.getDate() + "-" + Nowdate.getDay();
    var thisWeek = getWeekOfYear() - 9;
    for (let classCell of class_schedule) {
        for (let timeCell of classCell.time) {

            classscheduleTable.rows[timeCell.index].cells[timeCell.day].innerText = classCell.classname;
            if (timeCell.week.indexOf(thisWeek) == -1) {
                classscheduleTable.rows[timeCell.index].cells[timeCell.day].style.color="gray";
            }

        }
    }
}