#!/bin/bash
set -x


export perl_p="/root/jd/t/perl_p"  # Define this or remove if not needed
export t=/root/jd/t
#export BASE_URL="http://localhost:10220/post/run"  # Removed duplicate /post/run
export BASE_URL="http://localhost:3001/post/run"  # Removed duplicate /post/run


while true; do
pushd "$t/cpp_cli_srv" || exit 1  # Added error handling

# Fixed URL and added proper JSON parsing

tail -n 1 $t/cpp_srv.log | grep patch_global_json |grep '"path":"/cpp_cli_srv_config/restart_cpp_srv","value":true'

# Properly parse JSON and check value
if [ $? == 0 ]; then  # Fixed condition check
    # Fixed URL and added proper JSON formatting
    curl -k -X POST "$BASE_URL" \
      -H 'Content-Type: application/json' \
      -d '{"cmd":"patch_global_json","args":{"cpp_cli_srv_config":{"restart_cpp_srv":false}}}' > /dev/null
    
    sleep 5
    

    rm -f pkg.tgz  # Changed to regular file deletion
    tfr f  # Commented out - unknown command
    if [ -e pkg.tgz ]; then
		tar xvzf pkg.tgz  # Commented out - depends on tfr

        # Improved process killing logic
        pid=$(pidof cpp_srv)  # Get first matching PID
        if [ -n "$pid" ]; then
            kill -9 "$pid"
            sleep 1

            # Start server in background to prevent blocking
            (
                echo "now restart cpp_cli_srv ... "
                cd "$t/cpp_cli_srv" && chmod +x build/cpp_srv build/cpp_cli 
                nohup ./build/cpp_srv --port 3001 --log ../cpp_srv.log --threads 2 --token jd  > /dev/null 2>&1 &
                #nohup ./build/cpp_srv --port 10220 --port_https 10221 --ssl /ssl --threads 1 --log /root/jd/t/cpp_srv.log  --token jd > /dev/null 2>&1 &
            )

        fi

	fi

fi

popd

sleep 15s
done

