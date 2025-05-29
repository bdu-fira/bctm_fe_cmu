import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { renderDraggableItem } from '../utils/renderDraggableItem.jsx';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell } from 'docx';
import { saveAs } from 'file-saver';

const ReportTemplate = ({
  arrangedContent,
  departments,
  contentTypes,
  selectedContentTypes,
  userInfo,
  modalReports,
  selectedReport,
  previewContent,
  getWeek,
  onExport,
}) => {
  const departmentName =
    userInfo.tenDonVi ||
    departments.find(d => d.maDonVi === selectedReport?.maDonVi)?.tenDonVi ||
    'Không xác định';
  const reportDate = selectedReport?.ngayTao
  ? new Date(selectedReport.ngayTao)
  : new Date();
const day = reportDate.getDate();
const month = reportDate.getMonth() + 1;
const year = reportDate.getFullYear();
const week = getWeek(reportDate);
  const signatory = userInfo.tenGiangVien || '';

  const exportToDocx = async () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
           
            new Table({
              alignment: 'center',
              borders: {
                top: { style: 'None' },
                bottom: { style: 'None' },
                left: { style: 'None' },
                right: { style: 'None' },
                insideHorizontal: { style: 'None' },
                insideVertical: { style: 'None' },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'TRƯỜNG ĐẠI HỌC BÌNH DƯƠNG',
                              bold: true,
                              font: 'Times New Roman',
                              size: 26,
                            }),
                          ],
                          alignment: 'center',
                          spacing: { after: 100 },
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: departmentName,
                              bold: true,
                              font: 'Times New Roman',
                              size: 26,
                            }),
                          ],
                          alignment: 'center',
                          spacing: { after: 100 },
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM',
                              bold: true,
                              font: 'Times New Roman',
                              size: 26,
                            }),
                          ],
                          alignment: 'center',
                          spacing: { after: 100 },
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'Độc lập - Tự do - Hạnh phúc',
                              bold: true,
                              underline: {},
                              font: 'Times New Roman',
                              size: 26,
                            }),
                          ],
                          alignment: 'center',
                          spacing: { after: 100 },
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `Bình Dương, ngày ${day} tháng ${month} năm ${year}`,
                              italic: true,
                              font: 'Times New Roman',
                              size: 26,
                            }),
                          ],
                          alignment: 'center',
                          spacing: { after: 200 },
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            // Blank line
            new Paragraph({
              children: [
                new TextRun({
                  text: ' ',
                  font: 'Times New Roman',
                  size: 26,
                }),
              ],
              spacing: { after: 200 },
            }),

            // Title
            new Paragraph({
              children: [
                new TextRun({
                  text: 'BÁO CÁO',
                  bold: true,
                  font: 'Times New Roman',
                  size: 52,
                }),
              ],
              alignment: 'center',
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Kết quả thực hiện nhiệm vụ của đơn vị tuần ${week}`,
                  bold: true,
                  font: 'Times New Roman',
                  size: 26,
                }),
              ],
              alignment: 'center',
              spacing: { after: 200 },
            }),

            // Introduction
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Kính gửi: Hiệu trưởng.',
                  font: 'Times New Roman',
                  size: 26,
                }),
              ],
              alignment: 'center',
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Căn cứ kết luận tại buổi họp chuyên môn ${departmentName} năm học 2024 – 2025;`,
                  font: 'Times New Roman',
                  size: 26,
                  italic: true,
                }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Căn cứ nội dung triển khai nhiệm vụ tuần ${week} của ${departmentName}.`,
                  font: 'Times New Roman',
                  size: 26,
                  italic: true,
                }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Thực hiện chỉ đạo của Hiệu trưởng về việc báo cáo công tác thực hiện nhiệm vụ của đơn vị định kỳ hàng tuần. Nay ${departmentName} báo cáo kết quả thường xuyên nhiệm vụ của đơn vị tuần ${week}, cụ thể như sau:`,
                  font: 'Times New Roman',
                  size: 26,
                }),
              ],
              spacing: { after: 400 },
            }),

            // Section I
            new Paragraph({
              children: [
                new TextRun({
                  text: 'I. CÔNG VIỆC TRIỂN KHAI THỰC HIỆN NHIỆM VỤ',
                  bold: true,
                  font: 'Times New Roman',
                  size: 26,
                }),
              ],
              spacing: { after: 200 },
            }),
            ...(arrangedContent.noidung1.length > 0
              ? arrangedContent.noidung1.flatMap((item, index) => {
                  if (!item || !item.danhMuc || !Array.isArray(item.danhMuc) || item.danhMuc.length === 0) {
                    console.warn(`Invalid item at index ${index} in noidung1 during export:`, item);
                    return [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Lỗi: Dữ liệu không hợp lệ',
                            font: 'Times New Roman',
                            size: 26,
                            color: 'FF0000',
                          }),
                        ],
                        spacing: { after: 200 },
                      }),
                    ];
                  }

                  const content = (item.danhMuc[0]?.noiDung || []).filter(
                    nd => nd?.noiDung && nd.noiDung.trim() !== ''
                  );
                  if (content.length === 0) {
                    return [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: '- Không',
                            font: 'Times New Roman',
                            size: 26,
                            color: '000000',
                          }),
                        ],
                        spacing: { after: 200 },
                      }),
                    ];
                  }
                  return [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${item.subSection || `1.${index + 1}`} ${item.danhMuc[0]?.tenDanhMuc || 'Không xác định'}:`,
                          font: 'Times New Roman',
                          size: 26,
                          bold: true,
                        }),
                      ],
                      spacing: { after: 100 },
                    }),
                    ...content.map(nd =>
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `- ${nd.noiDung}`,
                            font: 'Times New Roman',
                            size: 26,
                          }),
                        ],
                        indent: { left: 720 },
                        spacing: { after: 100 },
                      })
                    ),
                  ];
                })
              : [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: ' ',
                        font: 'Times New Roman',
                        size: 26,
                      }),
                    ],
                    spacing: { after: 200 },
                  }),
                ]),

            // Section II
            new Paragraph({
              children: [
                new TextRun({
                  text: 'II. NỘI DUNG CÔNG VIỆC CHƯA THỰC HIỆN TRONG TUẦN, CÒN TỒN ĐỌNG CHƯA THỰC HIỆN, LÝ DO:',
                  bold: true,
                  font: 'Times New Roman',
                  size: 26,
                }),
              ],
              spacing: { after: 200 },
            }),
            ...(arrangedContent.noidung2.length > 0
              ? arrangedContent.noidung2.flatMap((item, index) => {
                  if (!item || !item.danhMuc || !Array.isArray(item.danhMuc) || item.danhMuc.length === 0) {
                    console.warn(`Invalid item at index ${index} in noidung2 during export:`, item);
                    return [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Lỗi: Dữ liệu không hợp lệ',
                            font: 'Times New Roman',
                            size: 26,
                            color: 'FF0000',
                          }),
                        ],
                        spacing: { after: 200 },
                      }),
                    ];
                  }

                  const noiDung = (item.danhMuc[0]?.noiDung || []).filter(
                    nd => nd?.noiDung && nd.noiDung.trim() !== ''
                  );
                  if (noiDung.length === 0) {
                    return [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: '- Không',
                            font: 'Times New Roman',
                            size: 26,
                            color: '000000',
                          }),
                        ],
                        spacing: { after: 200 },
                      }),
                    ];
                  }
                  return [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${item.subSection || `2.${index + 1}`} ${item.danhMuc[0]?.tenDanhMuc || 'Không xác định'}:`,
                          font: 'Times New Roman',
                          size: 26,
                          bold: true,
                        }),
                      ],
                      spacing: { after: 100 },
                    }),
                    ...noiDung.map(nd =>
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `- ${nd.noiDung}`,
                            font: 'Times New Roman',
                            size: 26,
                          }),
                        ],
                        indent: { left: 720 },
                        spacing: { after: 100 },
                      })
                    ),
                  ];
                })
              : [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: ' ',
                        font: 'Times New Roman',
                        size: 26,
                      }),
                    ],
                    spacing: { after: 200 },
                  }),
                ]),

            // Section III
            new Paragraph({
              children: [
                new TextRun({
                  text: 'III. ĐỀ XUẤT, KIẾN NGHỊ',
                  bold: true,
                  font: 'Times New Roman',
                  size: 26,
                }),
              ],
              spacing: { after: 200 },
            }),
            ...(arrangedContent.noidung3.length > 0
              ? arrangedContent.noidung3.flatMap((item, index) => {
                  if (!item || !item.danhMuc || !Array.isArray(item.danhMuc) || item.danhMuc.length === 0) {
                    console.warn(`Invalid item at index ${index} in noidung3 during export:`, item);
                    return [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Lỗi: Dữ liệu không hợp lệ',
                            font: 'Times New Roman',
                            size: 26,
                            color: 'FF0000',
                          }),
                        ],
                        spacing: { after: 200 },
                      }),
                    ];
                  }

                  const noiDung = (item.danhMuc[0]?.noiDung || []).filter(
                    nd => nd?.noiDung && nd.noiDung.trim() !== ''
                  );
                  if (noiDung.length === 0) {
                    return [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: '- Không',
                            font: 'Times New Roman',
                            size: 26,
                            color: '000000',
                          }),
                        ],
                        spacing: { after: 200 },
                      }),
                    ];
                  }
                  return [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${item.subSection || `3.${index + 1}`} ${item.danhMuc[0]?.tenDanhMuc || 'Không xác định'}:`,
                          font: 'Times New Roman',
                          size: 26,
                          bold: true,
                        }),
                      ],
                      spacing: { after: 100 },
                    }),
                    ...noiDung.map(nd =>
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `- ${nd.noiDung}`,
                            font: 'Times New Roman',
                            size: 26,
                          }),
                        ],
                        indent: { left: 720 },
                        spacing: { after: 100 },
                      })
                    ),
                  ];
                })
              : [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: ' ',
                        font: 'Times New Roman',
                        size: 26,
                      }),
                    ],
                    spacing: { after: 200 },
                  }),
                ]),

            // Closing
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Kính trình báo cáo./.',
                  font: 'Times New Roman',
                  size: 26,
                }),
              ],
              spacing: { after: 200 },
            }),

         
            new Table({
              width: {
                size: 100,
                type: 'pct',
              },
              borders: {
                top: { style: 'None' },
                bottom: { style: 'None' },
                left: { style: 'None' },
                right: { style: 'None' },
                insideHorizontal: { style: 'None' },
                insideVertical: { style: 'None' },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: {
                        size: 50,
                        type: 'pct',
                      },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'Nơi nhận:',
                              bold: true,
                              font: 'Times New Roman',
                              size: 26,
                            }),
                          ],
                          spacing: { after: 100 },
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: '- Như trên;',
                              font: 'Times New Roman',
                              size: 26,
                            }),
                          ],
                          spacing: { after: 100 },
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: '- Phòng Tổng hợp;',
                              font: 'Times New Roman',
                              size: 26,
                            }),
                          ],
                          spacing: { after: 100 },
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: '- Phòng ĐBCL và KT;',
                              font: 'Times New Roman',
                              size: 26,
                            }),
                          ],
                          spacing: { after: 100 },
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: '- Lưu: AIDTI, VPhuc.',
                              font: 'Times New Roman',
                              size: 26,
                            }),
                          ],
                          spacing: { after: 200 },
                        }),
                      ],
                    }),
                    new TableCell({
                      width: {
                        size: 50,
                        type: 'pct',
                      },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'VIỆN TRƯỜNG',
                              bold: true,
                              font: 'Times New Roman',
                              size: 26,
                            }),
                          ],
                          alignment: 'center',
                          spacing: { after: 100 },
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: '(ký và ghi rõ họ tên)',
                              font: 'Times New Roman',
                              size: 26,
                            }),
                          ],
                          alignment: 'center',
                          spacing: { after: 100 },
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: ' ',
                              font: 'Times New Roman',
                              size: 26,
                            }),
                          ],
                          spacing: { after: 200 },
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: signatory,
                              font: 'Times New Roman',
                              size: 26,
                            }),
                          ],
                          alignment: 'center',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `bao_cao_tuan_${week}.docx`);
    onExport();
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg max-w-3xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between mb-4">
        <div className="text-center">
          <p className="text-base font-bold">TRƯỜNG ĐẠI HỌC BÌNH DƯƠNG</p>
          <p className="text-base font-bold">{departmentName}</p>
        </div>
        <div className="text-center">
          <p className="text-base font-bold">CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
          <p className="text-base font-bold underline">Độc lập - Tự do - Hạnh phúc</p>
          <p className="text-base italic">
            Bình Dương, ngày {day} tháng {month} năm {year}
          </p>
        </div>
      </div>

      {/* Blank Line */}
      <div className="mb-4">
        <p className="text-base"> </p>
      </div>

      {/* Title */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold">BÁO CÁO</h1>
        <h2 className="text-base font-bold">
          Kết quả thực hiện nhiệm vụ của đơn vị tuần {week}
        </h2>
      </div>

      {/* Introduction */}
      <div className="mb-4">
        <p className="text-base text-center">Kính gửi: Hiệu trưởng.</p>
        <p className="text-base italic">
          Căn cứ kết luận tại buổi họp chuyên môn {departmentName} năm học 2024 – 2025;
        </p>
        <p className="text-base italic">
          Căn cứ nội dung triển khai nhiệm vụ tuần {week} của {departmentName}.
        </p>
        <p className="text-base">
          Thực hiện chỉ đạo của Hiệu trưởng về việc báo cáo công tác thực hiện nhiệm vụ của đơn vị định kỳ hàng tuần. Nay {departmentName} báo cáo kết quả thường xuyên nhiệm vụ của đơn vị tuần {week}, cụ thể như sau:
        </p>
      </div>

      {/* Section I */}
      <div className="mb-4">
        <h3 className="text-base font-bold">I. CÔNG VIỆC TRIỂN KHAI THỰC HIỆN NHIỆM VỤ</h3>
        <Droppable droppableId="noidung1" isCombineEnabled={false}>
          {(provided) => (
            <div
              className="p-2 rounded-lg min-h-[50px] mt-2 bg-gray-100"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {arrangedContent.noidung1.length > 0 ? (
                arrangedContent.noidung1.map((item, index) => {
                  if (!item || !item.danhMuc || !Array.isArray(item.danhMuc) || item.danhMuc.length === 0) {
                    console.warn(`Invalid item at index ${index} in noidung1:`, item);
                    return (
                      <div key={index} className="mb-2">
                        <p className="text-red-500">Lỗi: Dữ liệu không hợp lệ</p>
                      </div>
                    );
                  }
                  const content = (item.danhMuc[0]?.noiDung || []).filter(nd => nd?.noiDung && nd.noiDung.trim() !== '');
                  if (content.length === 0) {
                    return (
                      <div key={index} className="mb-2">
                        <p className="text-gray-500 text-base">Không</p>
                        {renderDraggableItem(item, index, 'noidung1', departments, contentTypes, selectedContentTypes, getWeek)}
                      </div>
                    );
                  }
                  return (
                    <div key={index} className="mb-2">
                      <p className="font-semibold">
                        {item.subSection || `1.${index + 1}`} {item.danhMuc[0]?.tenDanhMuc || 'Không xác định'}:
                      </p>
                      {content.map((nd, idx) => (
                        <p key={idx} className="ml-4 text-base">
                          - {nd.noiDung}
                        </p>
                      ))}
                      {renderDraggableItem(item, index, 'noidung1', departments, contentTypes, selectedContentTypes, getWeek)}
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-base">Kéo thả nội dung vào đây</p>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>

      {/* Section II */}
      <div className="mb-4">
        <h3 className="text-base font-bold">
          II. NỘI DUNG CÔNG VIỆC CHƯA THỰC HIỆN TRONG TUẦN, CÒN TỒN ĐỌNG CHƯA THỰC HIỆN, Lý DO:
        </h3>
        <Droppable droppableId="noidung2" isCombineEnabled={false}>
          {(provided) => (
            <div
              className="p-2 rounded-lg min-h-[50px] mt-2 bg-gray-100"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {arrangedContent.noidung2.length > 0 ? (
                arrangedContent.noidung2.map((item, index) => {
                  if (!item || !item.danhMuc || !Array.isArray(item.danhMuc) || item.danhMuc.length === 0) {
                    console.warn(`Invalid item at index ${index} in noidung2:`, item);
                    return (
                      <div key={index} className="mb-2">
                        <p className="text-red-500">Lỗi: Dữ liệu không hợp lệ</p>
                      </div>
                    );
                  }
                  const noiDung = (item.danhMuc[0]?.noiDung || []).filter(nd => nd?.noiDung && nd.noiDung.trim() !== '');
                  if (noiDung.length === 0) {
                    return (
                      <div key={index} className="mb-2">
                        <p className="text-gray-500 text-base">Không</p>
                        {renderDraggableItem(item, index, 'noidung2', departments, contentTypes, selectedContentTypes, getWeek)}
                      </div>
                    );
                  }
                  return (
                    <div key={index} className="mb-2">
                      <p className="font-semibold">
                        {item.subSection || `2.${index + 1}`} {item.danhMuc[0]?.tenDanhMuc || 'Không xác định'}:
                      </p>
                      {noiDung.map((nd, idx) => (
                        <p key={idx} className="ml-4 text-base">
                          - {nd.noiDung}
                        </p>
                      ))}
                      {renderDraggableItem(item, index, 'noidung2', departments, contentTypes, selectedContentTypes, getWeek)}
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-base">Kéo thả nội dung vào đây</p>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>

      {/* Section III */}
      <div className="mb-4">
        <h3 className="text-base font-bold">III. ĐỀ XUẤT, KIẾN NGHỊ</h3>
        <Droppable droppableId="noidung3" isCombineEnabled={false}>
          {(provided) => (
            <div
              className="p-2 rounded-lg min-h-[50px] mt-2 bg-gray-100"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {arrangedContent.noidung3.length > 0 ? (
                arrangedContent.noidung3.map((item, index) => {
                  if (!item || !item.danhMuc || !Array.isArray(item.danhMuc) || item.danhMuc.length === 0) {
                    console.warn(`Invalid item at index ${index} in noidung3:`, item);
                    return (
                      <div key={index} className="mb-2">
                        <p className="text-red-500">Lỗi: Dữ liệu không hợp lệ</p>
                      </div>
                    );
                  }
                  const noiDung = (item.danhMuc[0]?.noiDung || []).filter(nd => nd?.noiDung && nd.noiDung.trim() !== '');
                  if (noiDung.length === 0) {
                    return (
                      <div key={index} className="mb-2">
                        <p className="text-gray-500 text-base">Không</p>
                        {renderDraggableItem(item, index, 'noidung3', departments, contentTypes, selectedContentTypes, getWeek)}
                      </div>
                    );
                  }
                  return (
                    <div key={index} className="mb-2">
                      <p className="font-semibold">
                        {item.subSection || `3.${index + 1}`} {item.danhMuc[0]?.tenDanhMuc || 'Không xác định'}:
                      </p>
                      {noiDung.map((nd, idx) => (
                        <p key={idx} className="ml-4 text-base">
                          - {nd.noiDung}
                        </p>
                      ))}
                      {renderDraggableItem(item, index, 'noidung3', departments, contentTypes, selectedContentTypes, getWeek)}
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-base">Kéo thả nội dung vào đây</p>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>

      {/* Closing */}
      <div className="mb-4">
        <p className="text-base">Kính trình báo cáo./.</p>
        <div className="flex justify-between">
          <div>
            <p className="text-base font-bold">Nơi nhận:</p>
            <p className="text-base">- Như trên;</p>
            <p className="text-base">- Phòng Tổng hợp;</p>
            <p className="text-base">- Phòng ĐBCL và KT;</p>
            <p className="text-base">- Lưu: AIDTI, VPhuc.</p>
          </div>
          <div className="text-right">
            <p className="text-base font-bold">VIỆN TRƯỜNG</p>
            <p className="text-base">(ký và ghi rõ họ tên)</p>
            <p className="text-base">{signatory}</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={() => onExport()}
          className="bg-gray-600 text-white px-6 py-2 rounded-xl hover:bg-gray-700 transition-all duration-300"
        >
          Hủy
        </button>
        <button
          onClick={exportToDocx}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-all duration-300"
        >
          Xuất file
        </button>
      </div>
    </div>
  );
};

export default ReportTemplate;