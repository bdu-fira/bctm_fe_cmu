import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

export const renderDraggableItem = (item, index, droppableId, departments, contentTypes, selectedContentTypes, getWeek) => {
  // Ensure we have the required data
  if (!item || !item.danhMuc || item.danhMuc.length === 0) {
    return null;
  }

  // Find the contentType name based on maLoaiNoiDung
  let contentTypeName = item.contentTypeName; // Use the name we added in openExportModal
  if (!contentTypeName && item.danhMuc[0]?.noiDung && item.danhMuc[0]?.noiDung[0]) {
    const maLoaiNoiDung = item.danhMuc[0].noiDung[0].maLoaiNoiDung;
    contentTypeName = contentTypes.find(ct => ct.maLoaiNoiDung === maLoaiNoiDung)?.tenLoaiNoiDung || 
      (maLoaiNoiDung === 1 ? 'Kết quả đạt được trong tuần' : 
       maLoaiNoiDung === 2 ? 'Nội dung tuần sau' : 'Đề xuất, kiến nghị');
  }

  // Get section number (I, II, III)
  const section = item.section || '';

  // Get department name
  const departmentName = departments.find(d => d.maDonVi === item.maDonVi)?.tenDonVi || 'Không xác định';
  
  // Get category name
  const categoryName = item.danhMuc[0]?.tenDanhMuc || 'Không xác định';
  
  // Get content
  const content = item.danhMuc[0]?.noiDung?.[0]?.noiDung || '';
  
  return (
    <Draggable draggableId={`${droppableId}-item-${index}`} index={index} key={`${droppableId}-item-${index}`}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="p-3 bg-white rounded-lg shadow-md mb-3 border-l-4 border-orange-500"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="font-semibold text-orange-700">{section}. {contentTypeName}</div>
            <div className="text-xs bg-gray-100 rounded-full px-2 py-1">{departmentName}</div>
          </div>
          <div className="mb-2 text-sm text-gray-500">{categoryName}</div>
          <div className="text-sm bg-orange-50 p-2 rounded">{content}</div>
        </div>
      )}
    </Draggable>
  );
};
