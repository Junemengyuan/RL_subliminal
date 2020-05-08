<?php
    $fname = $_POST['filename'];
    $name = "data/$fname.csv";
    $data = $_POST['filedata'];
    file_put_contents($name,$data);
?>
