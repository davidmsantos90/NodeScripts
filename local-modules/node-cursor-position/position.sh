#!/bin/bash

# based on a script from http://invisible-island.net/xterm/xterm.faq.html
exec < /dev/tty
oldstty=$(stty -g)
stty raw -echo min 0

# on my system, the following line can be replaced by the line below it
echo -en "\033[6n" > /dev/tty
# tput u7 > /dev/tty    # when TERM=xterm (and relatives)

IFS=';' read -r -d R -a pos
stty $oldstty

# change from one-based to zero based so they work with: tput cup $row $col
row=$((${pos[0]:2} - 1))    # strip off the esc-[
col=$((${pos[1]} - 1))


echo -n "{\"row\": $row, \"col\": $col}" # output position as JSON

# blocks script execution

# function row {
#     local COL
#     local ROW
#     IFS=';' read -sdR -p $'\E[6n' ROW COL
#     echo $((${ROW#*[} - 1))
#     # echo "${ROW#*[}"
# }
#
# function col {
#     local COL
#     local ROW
#     IFS=';' read -sdR -p $'\E[6n' ROW COL
#     echo $((${COL} - 1))
#     # echo "${COL}"
# }
#
# ROW1=$(row)
# COL1=$(col)
# echo "{row: $ROW1, col: $COL1}"

# tput sc         # Save cursor position
# tput cup 5 10   # Move to row 6 col 11
# POS1=$(pos)     # Get the cursor position
# ROW1=$(row)
# COL1=$(col)
# tput cup 25 15  # Move to row 25 col 15
# POS2=$(pos)     # Get the cursor position
# ROW2=$(row)
# COL2=$(col)
# tput rc # Restore cursor position
# echo $BASH_VERSION
# echo $POS1 $ROW1 $COL1
# echo $POS2 $ROW2 $COL2
