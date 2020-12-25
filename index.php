<?php

// ----------------------------------------------------------------------------------
// Settings
// ----------------------------------------------------------------------------------

    // Password
    $pw = "AveSatanas666";

    // Directories
    $ndir = "notes";
    $tdir = "settings";
    $sdir = "sessions";
    $mdir = "media";
    $rdir = "recyclebin";
    $bgsdir = "${tdir}/backgrounds";

    // Note colors
    $colors = ['yellow', 'pink', 'blue', 'green', 'white', 'black'];

    // Default background
    $bg = 'settings/backgrounds/wood.jpg';
    
// ----------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------

    $printRefresh = false;
    $printHtml = false;
    $printLogin = true;
    
    $printPage = false;
    $logged = false;

    function list_sessions() {
        global $sdir;
        $sessions = array_diff(scandir($sdir), array('..', '.'));
        $sessions = preg_grep('/^([^.])/' $sessions);
        if(count($sessions) > 0){
            foreach($sessions as $session){
                $nj = json_decode(file_get_contents("${sdir}/${session}"));
                $time = $nj->{'time'};
                $id = $nj->{'id'};
                $device = $nj->{'device'};
                $ip = $nj->{'ip'};
                $partial_ip = "*.*.".  explode(".", $ip)[2] . "." . explode(".", $ip)[3];
                echo "<div class=\"item old\" data-val=\"${id}\">${device} <span class=\"s\">${partial_ip}</span></div>";
            }
        } else {
            echo "No sessions found.";
        }
    }

    function list_backgrounds() {
        global $bgsdir;
        $bgs = array_diff(scandir($bgsdir), array('..', '.'));
        $bgs = preg_grep('/^([^.])/' $bgs);
        if(count($bgs) > 0){
            foreach($bgs as $bg){
                $bgName = ucfirst(str_replace('-', ' ', explode('.', $bg)[0]));
                echo "<div class=\"item\" data-val=\"${bg}\">${bgName}</div>";
            }
        } else {
            echo "No backgrounds found.";
        }
    }

    function list_notes($dir) {
        $notes = array_diff(scandir($dir), array('..', '.'));
        $notes = preg_grep('/^([^.])/', $notes);
        $notes = array_reverse($notes);
        if(count($notes) > 0){
            foreach($notes as $note){
                print_note($dir, $note);
            }
        } else {
            echo "<div class=\"empty-board\">Double click to add your first note.</div>";
        }
    }

    function print_note($dir, $note_id){
        global $colors, $rdir;

        $simplebar = 'data-simplebar';
        if($dir==$rdir){
            $simplebar = '';
        }

        if(file_exists("${dir}/${note_id}") ){
            $nj = json_decode(file_get_contents("${dir}/${note_id}"));
            $note_txt = $nj->{'content'};
            $note_color = $nj->{'color'};
            $note_width = $nj->{'width'};
            $note_height = $nj->{'height'};
            $note_left = $nj->{'left'};
            $note_top = $nj->{'top'};
            $note_zindex = $nj->{'zindex'};
            $note_id = explode('.', $note_id)[0];

            $note_html = $note_txt;
            $note_html = str_replace("\n\n", "<div class=\"line-break\"></div>", $note_html);
            $note_html = str_replace("\n", "<br class=\"br\">", $note_html);
            echo "<div class=\"note noted read bg-${note_color}\" data-color=\"${note_color}\" id=\"${note_id}\" style=\"left:${note_left}px;top:${note_top}px;width:${note_width}px;height:${note_height}px;z-index:${note_zindex};\">";
            echo "<div class=\"edit dpn color-selection\">";
            foreach($colors as $color){
                echo "<label class=\"color-container\">";
                echo "<input type=\"radio\" name=\"color\" value=\"${color}\" class=\"${color}\">";
                echo "<span class=\"${color} checkmark\" data-color=\"${color}\"></span>";
                echo "</label>";
            }
            echo "</div>";
            echo "<div class=\"read content\" ${simplebar}>";
            echo $note_html;
            echo "</div>";
            echo "<div class=\"edit dpn note-content\" ${simplebar}>";
            echo "<div class=\"content-input\" contentEditable=\"true\"  >${note_txt}</div>";
            echo "</div>";
            echo "<input type=\"hidden\" class=\"color\" value=\"${note_color}\">";
            echo "<button id=\"\" class=\"edit dpn save_note\"><i class=\"fa fa-floppy-o\" aria-hidden=\"true\"></i></button>";
            echo "<button id=\"\" class=\"edit dpn delete_note\"><i class=\"fa fa-trash\" aria-hidden=\"true\"></i></button>";
            echo "</div>";
        }
    }

    function check_session(){
        global $sdir;
        return isset($_COOKIE['np_lses']) && file_exists("${sdir}/" . $_COOKIE['np_lses'] . ".json");
    }

    function embedLinks($content){
        if(strpos($content, '<embed-link>') !== false){
            $temp = explode("<embed-link>", $content);
            $links = [];
            $output = $temp[0];
            for($i=1; $i < count($temp); $i++){
                $pts = explode("</embed-link>", $temp[$i]);
                $url = $pts[0];
                $content = $pts[1];
                $page = file_get_contents($url);
                $title = preg_match('/<title[^>]*>(.*?)<\/title>/ims', $page, $match) ? $match[1] : null;
                $embedLink = "<a class=\"embed-link\" href=\"${url}\">${title}</a>";
                $output .= $embedLink . $content;
            }
            return $output;
        } else {
            return $content;
        }
    }

    // No password given or wrong password.
    if( !check_session() && ( !isset($_POST['pw']) || (isset($_POST['pw']) && $_POST['pw'] != $pw ) ) ){
        $logged = false;
        $printHtml = true;
        $printPage = false;
        if(!isset($_POST['pw'])){
            $title = "Pwst-it<sup>®</sup>";
        }
        else if(isset($_POST['pw']) && $_POST['pw'] != pw){
            $title = "Nope.";
        }
    }
    // Password given and password correct.
    else if (!check_session() && (isset($_POST['pw']) && $_POST['pw'] == $pw)){
        $id = uniqid();
        $session_data = array(
            'id' => $id,
            'time' => date("YmdHis"),
            'device' => $_POST['device'],
            'ip' => $_SERVER['REMOTE_ADDR']
        );
        $session_json = json_encode($session_data);
        $content = $_POST['device'];
        $ip = $_SERVER['REMOTE_ADDR'];
        file_put_contents("${sdir}/${id}.json", $session_json);
        setcookie("np_lses", $id, time() + (10 * 365 * 24 * 60 * 60));
        $logged = true;
        $printHtml = true;
    
    } else if (check_session()){
        $logged = true;
        $printHtml = true;
    } else {
        // Something very strange just went down.
        echo "POLIISI has received your cybercrime report.";
    }
    // Logged in    
    if ( $logged==true) {
        if ( isset($_POST['action']) && ($_POST['action']=='new_note' || $_POST['action']=='update_note') ){
            if($_POST['id'] == 'new_note'){
                $note_id = date("YmdHis");
            } else {
                $note_id = $_POST['id'];
            }
            $top = $_POST['top'];
            $left = $_POST['left'];
            $height = $_POST['height'];
            $width = $_POST['width'];
            $zindex = $_POST['zindex'];
            $color = $_POST['color'];
            $content = $_POST['content'];

            $content = embedLinks($content);

            $note_data = array(
                'top' => $top,
                'left' => $left,
                'height' => $height,
                'width' => $width,
                'zindex' => $zindex,
                'color' => $color, 
                'content' => $content
            );

            $note_json = json_encode($note_data);

            if(!file_exists("${ndir}/${note_id}.json")){
                file_put_contents("${ndir}/${note_id}.json", $note_json);    
                print_note($ndir, "${note_id}.json");
            } else {
                file_put_contents("${ndir}/${note_id}.json", $note_json);
                print_note($ndir, "${note_id}.json");
            }
            file_put_contents("${tdir}/z-index.txt", $zindex);
            $printHtml = false;
            
        // User actions
        } else if (isset($_POST['action']) && $_POST['action'] == 'list_notes' ){
            if(isset($_POST['list']) && $_POST['list'] == 'bin'){
                list_notes($rdir);
            } else {
                list_notes($ndir);
            }
            $printHtml = false;
        } else if (isset($_POST['action']) && $_POST['action'] == 'logout'){
            $logoutId = $_POST['id'];
            unlink("${sdir}/${logoutId}.json");
            if($logoutId==$_COOKIE['np_lses']){
                echo "logout";
            } else {
                echo "update";
            }
            $printHtml = false;
        } else if (isset($_POST['action']) && $_POST['action'] == 'embed') {
            $url = $_POST['url'];
            echo $html;
            $printHtml = false;
        } else if (isset($_POST['note']) && $_POST['note'] != '') {
            print_note($ndir, "${note_id}.json");
            $printHtml = false;
        } else if (isset($_POST['action']) && $_POST['action'] == 'delete'){
            $noteId = $_POST['id'];
            rename("${ndir}/${noteId}.json", "${rdir}/${noteId}.json");
            echo "removed";
            $printHtml = false;
        } else if (isset($_POST['action']) && $_POST['action'] == 'permadelete'){
            $noteId = $_POST['id'];
            unlink("${rdir}/${noteId}.json");
            echo $noteId;
            $printHtml = false;
        } else if (isset($_POST['action']) && $_POST['action'] == 'restore'){
            $noteId = $_POST['id'];
            rename("${rdir}/${noteId}.json", "${ndir}/${noteId}.json");
            echo $noteId;
            $printHtml = false;
        } else if (isset($_POST['action']) && $_POST['action'] == 'upload') {
            $img_id = date("YmdHis");
            $uid = uniqid();
            $extension = explode('/', mime_content_type($_POST['data']))[1];
            $data = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $_POST['data']));
            file_put_contents("${mdir}/${img_id}_${uid}.${extension}", $data);
            echo "${mdir}/${img_id}_${uid}.${extension}";
            $printHtml = false;
        } else if (isset($_POST['action']) && $_POST['action'] == 'title') {
            $urlTitle = get_title($_POST['url']);
            echo $urlTitle;
            $printHtml = false;
        } else {
            $nj = json_decode(file_get_contents($json = "${sdir}/" . $_COOKIE['np_lses'] . ".json"));
            $login_time = $nj->{'time'};
            $login_id = $nj->{'id'};
            $login_device = $nj->{'device'};
            $login_ip = $nj->{'ip'};
            $partial_ip = "*.*." . explode(".", $login_ip)[2] . "." . explode(".", $login_ip)[3];
            if(isset($_COOKIE['np_pos'])){
                $posLeft = explode('x', $_COOKIE['np_pos'])[0];
                $posTop = explode('x', $_COOKIE['np_pos'])[1];
            } else {
                $posLeft = '0';
                $posTop = '0';
                setcookie("np_pos", $posLeft."x".$posTop, time() + (10 * 365 * 24 * 60 * 60));
            }
            if(isset($_COOKIE['np_bg'])){
                $bgimg = $_COOKIE['np_bg'];
                $bg = "${bgsdir}/${bgimg}";
            }
            $printPage = true;
        }
    }
    // Print page
    if( $printHtml==true ){
        
?>

<!doctype html>

<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Pwst-it® Personal Notes Board">
    <meta name="author" content="O. Inha">
    <title>Pwst-it®</title>    
    <link rel="shortcut icon" type="image/png" href="favicon.png">
    <link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css">
    <link rel="stylesheet/less" type="text/css" href="np.less" />
    <script src="//cdnjs.cloudflare.com/ajax/libs/less.js/3.0.2/less.min.js"></script>
    <link rel="stylesheet" href="resources/simplebar.css" />
    <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" integrity="sha512-5A8nwdMOWrSz20fDsjczgUidUBR8liPYU+WymTZP1lmY9G6Oc7HlZv156XqnsgNUzTyMefFTcsFH/tnJE/+xBg==" crossorigin="anonymous" />
    <script src="//ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/jquery.cookie@1.4.1/jquery.cookie.js"></script>
    <script src="resources/simplebar.js"></script>
    <script src="resources/ac.js"></script>
    <script>
    <?php
        if($printPage){
            echo "      var pLeft = " . $posLeft . ";\n";
            echo "      var pTop = " . $posTop . ";\n";
            echo "      var zDef = " . file_get_contents("${tdir}/z-index.txt") . ";\n";
        }
        $logStateClass = $logged ? 'logged' : 'login';
        $fontClass = 'annie-use-your-telescope';
        if( isset($_COOKIE['np_font']) ){
            $fontClass = $_COOKIE['np_font'];
        }
    ?>
    </script>

</head>
<body class="<?php echo $logStateClass; ?>">
<?php
        if($printPage){
?>

    <!-- board -->
    <div class="board-container">
        <div class="board <?php echo $fontClass; ?>" data-dblclick="1" style="background:url('<?php echo $bg; ?>')">
            <div class="bg" style="background:url('<?php echo $bg; ?>')"></div>
            <div class="hidden old_notes"></div>
            <div class="dpn noted new_note bg-yellow" id="new_note">
                <div class="color-selection">
                    <?php 
                        foreach($colors as $color){
                            echo "<label class=\"color-container\">";
                            echo "<input type=\"radio\" name=\"color\" value=\"${color}\" class=\"${color}\">";
                            echo "<span class=\"${color} checkmark\" data-color=\"${color}\"></span>";
                            echo "</label>";
                        }
                    ?>
                </div>
                <div class="note-content" data-simplebar>
                    <div class="content-input" placeholder="Enter a note" contentEditable="true"></div>
                </div>
                <input type="hidden" class="color" value="yellow">
                <button class="save_note"><i class="fa fa-floppy-o" aria-hidden="true"></i></button>
            </div>
            <div class="dpn disabler"></div>
            <div class="dpn disabler bg"></div>
        </div>
    </div>
 
    <!-- settings -->
    <div class="top-right">
        <div class="hidden loader">
            <i class="fa fa-floppy-o" aria-hidden="true"></i>
        </div>
        <div class="settings-container">
            <div class="settings-content">
                <div class="col left">
                    <div class="dropdown sessions" data-title="Signed in">
                        <div class="selected item" data-val="<?php echo $login_id; ?>"><?php echo "${login_device} <span class=\"s\">${partial_ip}</span>"; ?></div>
                        <div class="menu">
                            <div class="item custom red logout" data-val="logout">Sign out <i class="fa fa-sign-out"></i></div>
                            <div class="subtitle">Other active sessions.<br>Click to close session:</div>
                            <?php list_sessions(); ?>
                        </div>
                    </div>
                    <div class="dropdown defaultcolor" data-title="Default note colour" data-cook="np_defcolor">
                        <div class="selected item"></div>
                        <div class="menu">
                            <div class="item" data-val="lastused">Last used</div>
                            <?php
                                foreach($colors as $color){
                                    echo "<div class=\"item\" data-val=\"${color}\">" . ucfirst($color) . "</div>";
                                }
                            ?>
                        </div>
                    </div>
                    <div class="dropdown boardbg" data-title="Background image" data-cook="np_bg">
                        <div class="selected item">Wood</div>
                        <div class="menu">       
                            <?php list_backgrounds(); ?>
                            <div class="sliders">
                                <div class="slider size"></div>
                            </div>
                        </div>
                    </div>
                    <div class="dropdown font" data-title="Font" data-cook="np_font">
                        <div class="selected item"></div>
                        <div class="menu">
                            <div class="item" data-val="annie-use-your-telescope">Annies Telescope</div>
                            <div class="item" data-val="shadows-into-light">Shadows into Light</div>
                            <div class="item" data-val="saira-condensed">Saira Condensed</div>
                            <div class="item" data-val="poiret-one">Poiret One</div>
                            <div class="item" data-val="noto-sans">Noto Sans</div>
                            <div class="item" data-val="source-code-pro">Source Code Pro</div>
                        </div>
                    </div>
                    <div class="dropdown startin" data-title="Default board state" data-cook="np_state">
                        <div class="selected item"></div>
                        <div class="menu">
                            <div class="item" data-val="start-overview">Overview</div>
                            <div class="item" data-val="start-leftoff">Last position</div>
                        </div>
                    </div>
                </div>
                <div class="col right">
                    <button class="overview">
                        <i class="fa fa-search-minus"></i>
                        <i class="fa fa-search-plus dpn"></i>
                    </button>
                    <button class="transparency">
                        <i class="fa fa-eye"></i>
                    </button>
                    <button class="fullscreen">
                        <i class="fa fa-expand"></i>
                        <i class="fa fa-compress dpn"></i>
                    </button>
                    <button class="bin">
                        <i class="fa fa-recycle"></i>
                    </button>
                </div>
            </div>
            <div class="icon">
                <i class="fa fa-gear" aria-hidden="true"></i>
                <i class="fa fa-close dpn" aria-hidden="true"></i>
            </div>
        </div>
    </div>

    <!-- recycle bin -->
    <div class="recycle-bin">
        <div class="bin-scroller" data-simplebar>
            <h1>Recycle bin</h1>
            <div class="bin-content"></div>
        </div>
    </div>

    <!-- mobile ui -->
    <div class="mobile dpn">
        <div class="new_mobile">
            <input type="hidden" name="color" class="color" value="">
            <textarea></textarea>
            <div class="color-selection">
                <?php 
                    foreach($colors as $color){
                        echo "<label class=\"color-container\">";
                        echo "<input type=\"radio\" name=\"color\" value=\"${color}\" class=\"${color}\">";
                        echo "<span class=\"${color} checkmark\" data-color=\"${color}\"></span>";
                        echo "</label>";
                    }
                ?>
            </div>
            <button><i class="fa fa-floppy-o"></i></button>
        </div>
        <div class="old"></div>
    </div>

    <script src="np.js"></script>
<?php
    } else {    

        echo "<div class=\"login\">";
        echo "<h1>${title}</h1>";
        echo "<form method=\"post\" action=\".\">";
        echo "<input type=\"password\" class=\"password\" name=\"pw\" placeholder=\"Password\">";
        echo "<input type=\"text\" class=\"location\" name=\"device\" placeholder=\"Device/location\">";
        echo "<button type=\"submit\">Login</button>";
        echo "</form>";
        echo "</div>";
    }
?>

</body>
</html>

<?php
    }
?>
