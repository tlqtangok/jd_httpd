FROM httpd:latest

# Install Node.js LTS (v22.x)
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy httpd.conf with proxy configuration
COPY httpd.conf /usr/local/apache2/conf/httpd.conf

# Copy files to their organized locations
COPY html/ /usr/local/apache2/htdocs/
COPY cgi-bin/ /usr/local/apache2/cgi-bin/
COPY be/ /usr/local/apache2/be/
COPY start_servers.sh /usr/local/apache2/
COPY httpd-dav.conf /usr/local/apache2/conf/extra/
COPY user.passwd.basic /usr/local/apache2/
COPY ssl/ /usr/local/apache2/ssl/

# Install Express and dependencies
RUN cd /usr/local/apache2/be && npm install

# Install nodemon globally for easier access
RUN npm install -g nodemon

RUN chmod +x /usr/local/apache2/cgi-bin/*.js && \
    chmod +x /usr/local/apache2/start_servers.sh

# Create writable directories and files
RUN chmod 777 /usr/local/apache2/htdocs && \
    touch /usr/local/apache2/htdocs/inputstr.txt && \
    touch /usr/local/apache2/htdocs/inputstr_post.txt && \
    chmod 666 /usr/local/apache2/htdocs/inputstr.txt && \
    chmod 666 /usr/local/apache2/htdocs/inputstr_post.txt && \
    mkdir -p /usr/local/apache2/uploads && \
    mkdir -p /usr/local/apache2/var && \
    mkdir -p /usr/local/apache2/dat && \
    chmod 777 /usr/local/apache2/var && \
    chmod 777 /usr/local/apache2/uploads && \
    chmod 777 /usr/local/apache2/dat

EXPOSE 80 443

# Start backend servers and Apache
CMD ["/usr/local/apache2/start_servers.sh"]

