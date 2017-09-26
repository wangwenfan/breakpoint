<?php
header('Content-type: text/plain; charset=utf-8');
//文件数据
$files = $_FILES['theFile'];
//文件名
$fileName = $_REQUEST['fileName'];
//文件总大小
$totalSize = $_REQUEST['totalSize'];
//是否为末段
$isLastChunk = $_REQUEST['isLastChunk'];
//是否是第一次上传
$isFirstUpload = $_REQUEST['isFirstUpload'];

if ($_FILES['theFile']['error'] > 0) {
	$status = 500;
} else {
	// 此处为一般的文件上传操作
	// if (!move_uploaded_file($_FILES['theFile']['tmp_name'], 'upload/'. $_FILES['theFile']['name'])) {
	//     $status = 501;
	// } else {
	//     $status = 200;
	// }

	// 以下部分为文件断点续传操作
	// 如果第一次上传的时候，该文件已经存在，则删除文件重新上传
	if ($isFirstUpload == '1' && file_exists('upload/' . $fileName) && filesize('upload/' . $fileName) == $totalSize) {
		unlink('upload/' . $fileName);
	}

	// 否则继续追加文件数据
	if (!file_put_contents('upload/' . $fileName, file_get_contents($_FILES['theFile']['tmp_name']), FILE_APPEND)) {
		$status = 501;
	} else {
		// 在上传的最后片段时，检测文件是否完整（大小是否一致）
		if ($isLastChunk === '1') {
			if (filesize('upload/' . $fileName) == $totalSize) {
				$status = 200;
			} else {
				$status = 502;
			}
		} else {
			$status = 200;
		}
	}
}

echo json_encode(array(
	'status' => $status,
	'totalSize' => filesize('upload/' . $fileName),
	'isLastChunk' => $isLastChunk,
));

?>