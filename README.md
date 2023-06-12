# Advance Cross Cluster Search (CCS) Plugin 

Plugin requieres minimum Kibana 8.6.2

## Setting Up Kibana for developing 
1. Clone the Kibana Repository 
    ```
    git clone https://github.com/elastic/kibana.git
    ```
2. Checkout the version of kibana needed 
    ```
    git checkout v8.6.2
    ```
3. See the [kibana Getting started guide](https://www.elastic.co/guide/en/kibana/master/development-getting-started.html) for instructions setting up your development environment

## Developing 

Clone the repository into kibana/plugins/ directory 

  ```
  cd kibana/plugins/
  git clone https://gitlab.spectric.com/acecard/accs_plugin.git
  ```

## Configuration 
The plugin is disable by default. If you wish to enable it, add the following config to kibana.yml 

```yaml
accsPlugin.ui.enabled: true
```

## Note
The plugin when loaded for the first time does not select any of the remote cluster, therefore the search defaults to the regular ElasticSearch behavior.

The same happens when the user manually diselects all clusters.  

## Scripts

<dl>
  <dt><code>yarn kbn bootstrap</code></dt>
  <dd>Execute this to install node_modules and setup the dependencies in your plugin and in Kibana</dd>

  <dt><code>yarn plugin-helpers build</code></dt>
  <dd>Execute this to create a distributable version of this plugin that can be installed in Kibana</dd>
</dl>